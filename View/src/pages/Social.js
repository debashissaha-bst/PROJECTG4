import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'

const Social = () => {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState(null)

  const tokenHeader = user ? { Authorization: `Bearer ${user.token}` } : {}

  const loadData = async () => {
    if (!user) return
    try {
      const [usersRes, requestsRes] = await Promise.all([
        fetch('/api/social/users', { headers: tokenHeader }),
        fetch('/api/social/requests', { headers: tokenHeader })
      ])

      const usersJson = await usersRes.json()
      const requestsJson = await requestsRes.json()

      if (!usersRes.ok) {
        setError(usersJson.error || 'Failed to load users')
        return
      }
      if (!requestsRes.ok) {
        setError(requestsJson.error || 'Failed to load requests')
        return
      }

      setUsers(usersJson)
      setIncoming(requestsJson.incoming || [])
      setOutgoing(requestsJson.outgoing || [])
      setFriends(requestsJson.friends || [])
    } catch (e) {
      setError('Failed to load social data')
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const findFriendRelationWith = (userId) =>
    friends.find(
      (f) => f.from._id === userId || f.to._id === userId
    )

  const hasOutgoingTo = (userId) =>
    outgoing.some((r) => r.to._id === userId)

  const hasIncomingFrom = (userId) =>
    incoming.find((r) => r.from._id === userId)

  const handleSendRequest = async (toUserId) => {
    setError(null)
    try {
      const res = await fetch('/api/social/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenHeader
        },
        body: JSON.stringify({ toUserId })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to send request')
        return
      }
      await loadData()
    } catch (e) {
      setError('Failed to send request')
    }
  }

  const handleAcceptRequest = async (requestId) => {
    setError(null)
    try {
      const res = await fetch(`/api/social/requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: tokenHeader
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to accept request')
        return
      }
      await loadData()
    } catch (e) {
      setError('Failed to accept request')
    }
  }

  const loadMessages = async (friend) => {
    setError(null)
    setSelectedFriend(friend)
    try {
      const res = await fetch(`/api/social/messages/${friend._id}`, {
        headers: tokenHeader
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load messages')
        return
      }
      setMessages(json)
    } catch (e) {
      setError('Failed to load messages')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!selectedFriend || !newMessage.trim()) return
    setError(null)
    try {
      const res = await fetch(`/api/social/messages/${selectedFriend._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenHeader
        },
        body: JSON.stringify({ text: newMessage })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to send message')
        return
      }
      setMessages((prev) => [...prev, json])
      setNewMessage('')
    } catch (e) {
      setError('Failed to send message')
    }
  }

  const handleUnfriend = async (friendUserId) => {
    setError(null)
    try {
      const res = await fetch(`/api/social/friends/${friendUserId}`, {
        method: 'DELETE',
        headers: tokenHeader
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to unfriend')
        return
      }
      if (selectedFriend && selectedFriend._id === friendUserId) {
        setSelectedFriend(null)
        setMessages([])
      }
      await loadData()
    } catch (e) {
      setError('Failed to unfriend')
    }
  }

  const getFriendUserFromRelation = (relation) => {
    if (!relation) return null
    if (relation.from && relation.from._id && relation.from._id !== user.id && relation.from._id !== user._id) {
      return relation.from
    }
    return relation.to
  }

  if (!user) {
    return <p>You must be logged in to view this page.</p>
  }

  return (
    <div className="social-page">
      <div className="social-hero">
        <h2>Connect & Chat</h2>
        <p>Manage friends, requests, and private messages.</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="social-layout">
        <div className="social-column">
          <section className="social-section">
            <h3>Friends</h3>
            {friends.length === 0 && <p className="social-empty">You have no friends yet.</p>}
            {friends.map((f) => {
              const friendUser = getFriendUserFromRelation(f)
              if (!friendUser) return null
              return (
                <div key={f._id} className="social-user-card">
                  <div>
                    <strong>{friendUser.email}</strong>
                    {friendUser.name && (
                      <span className="social-user-name"> ({friendUser.name})</span>
                    )}
                  </div>
                  <div className="social-user-actions">
                    <button type="button" onClick={() => loadMessages(friendUser)}>
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${friendUser._id}`)}
                    >
                      View profile
                    </button>
                    <button
                      type="button"
                      className="unfriend-btn"
                      onClick={() => handleUnfriend(friendUser._id)}
                    >
                      Unfriend
                    </button>
                  </div>
                </div>
              )
            })}
          </section>

          <section className="social-section">
            <h3>All Users</h3>
            {users.map((u) => {
              const friendRel = findFriendRelationWith(u._id)
              const outgoingReq = hasOutgoingTo(u._id)
              const incomingReq = hasIncomingFrom(u._id)

              return (
                <div key={u._id} className="social-user-card">
                  <div>
                    <strong>{u.email}</strong>
                    {u.name && <span className="social-user-name"> ({u.name})</span>}
                  </div>
                  <div className="social-user-actions">
                    {friendRel && (
                      <span className="badge">Friend</span>
                    )}
                    {!friendRel && incomingReq && (
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(incomingReq._id)}
                      >
                        Accept request
                      </button>
                    )}
                    {!friendRel && !incomingReq && !outgoingReq && (
                      <button type="button" onClick={() => handleSendRequest(u._id)}>
                        Add friend
                      </button>
                    )}
                    {!friendRel && outgoingReq && (
                      <span className="badge">Request sent</span>
                    )}
                  </div>
                </div>
              )
            })}
          </section>

          <section className="social-section">
            <h3>Incoming requests</h3>
            {incoming.length === 0 && <p className="social-empty">No incoming requests.</p>}
            {incoming.map((r) => (
              <div key={r._id} className="social-request-card">
                <span>{r.from.email}</span>
                <button type="button" onClick={() => handleAcceptRequest(r._id)}>
                  Accept
                </button>
              </div>
            ))}
          </section>
        </div>

        <div className="social-column social-chat-column">
          <h3>Messages</h3>
          {!selectedFriend && <p className="social-empty">Select a friend to start chatting.</p>}
          {selectedFriend && (
            <>
              <h4 className="social-chat-title">Chat with {selectedFriend.email}</h4>
              <div className="messages-list">
                {messages.map((m) => {
                  const isIncoming =
                    selectedFriend && String(m.from) === selectedFriend._id
                  return (
                    <div
                      key={m._id}
                      className={isIncoming ? 'message message-incoming' : 'message message-outgoing'}
                    >
                      <span>{m.text}</span>
                    </div>
                  )
                })}
              </div>
              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Social

