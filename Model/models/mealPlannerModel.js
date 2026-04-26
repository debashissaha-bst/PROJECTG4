const MEAL_DATASET = [
  {
    id: 'b1',
    name: 'Veggie Oats Bowl',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Balanced', 'Low-Carb'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: ['gluten']
  },
  {
    id: 'b2',
    name: 'Greek Yogurt Berry Cup',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced', 'Low-Carb'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: ['dairy']
  },
  {
    id: 'b3',
    name: 'Scrambled Egg Spinach Plate',
    mealType: 'breakfast',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['egg']
  },
  {
    id: 'l1',
    name: 'Quinoa Chickpea Salad',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l2',
    name: 'Grilled Chicken Lettuce Wrap',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l3',
    name: 'Tofu Stir Fry',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Balanced', 'Low-Carb'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['soy']
  },
  {
    id: 'd1',
    name: 'Lentil Soup with Veggies',
    mealType: 'dinner',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd2',
    name: 'Baked Salmon and Greens',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: ['fish']
  },
  {
    id: 'd3',
    name: 'Turkey Veggie Bowl',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  }
]

const randomItem = (items) => items[Math.floor(Math.random() * items.length)]

const pickByType = (pool, type) => pool.filter((meal) => meal.mealType === type)

const mealFitness = (meal, preference, blockedAllergens) => {
  let score = 10
  if (meal.tags.includes(preference)) score += 15
  if (blockedAllergens.length > 0) {
    const hasBlocked = meal.allergens.some((allergen) => blockedAllergens.includes(allergen))
    if (hasBlocked) score -= 100
  }
  return score
}

const chromosomeFitness = (chromosome, preference, ageType, blockedAllergens) => {
  const mealScore = chromosome.reduce(
    (acc, meal) => acc + mealFitness(meal, preference, blockedAllergens),
    0
  )
  const ageBonus = chromosome.reduce(
    (acc, meal) => acc + (meal.ageTypes.includes(ageType) ? 5 : -20),
    0
  )
  return mealScore + ageBonus
}

const createChromosome = (mealPool) => {
  const breakfastPool = pickByType(mealPool, 'breakfast')
  const lunchPool = pickByType(mealPool, 'lunch')
  const dinnerPool = pickByType(mealPool, 'dinner')

  return [
    randomItem(breakfastPool),
    randomItem(lunchPool),
    randomItem(dinnerPool)
  ]
}

const crossover = (parentA, parentB) => {
  const split = 1 + Math.floor(Math.random() * 2)
  return [...parentA.slice(0, split), ...parentB.slice(split)]
}

const mutate = (chromosome, mealPool) => {
  const mutated = [...chromosome]
  const index = Math.floor(Math.random() * mutated.length)
  const type = mutated[index].mealType
  const sameTypePool = pickByType(mealPool, type)
  mutated[index] = randomItem(sameTypePool)
  return mutated
}

const byPreferenceAndAge = (meal, preference, ageType, blockedAllergens) => {
  const ageAllowed = meal.ageTypes.includes(ageType)
  if (!ageAllowed) return false

  if (preference !== 'Allergy-Specific' && !meal.tags.includes(preference)) {
    return false
  }

  if (blockedAllergens.length > 0) {
    const hasBlocked = meal.allergens.some((allergen) => blockedAllergens.includes(allergen))
    if (hasBlocked) return false
  }

  return true
}

const generatePersonalizedMeals = ({
  preference = 'Balanced',
  ageType = 'adult',
  allergies = []
}) => {
  const blockedAllergens = allergies
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean)

  let filtered = MEAL_DATASET.filter((meal) =>
    byPreferenceAndAge(meal, preference, ageType, blockedAllergens)
  )

  const hasAllTypes =
    pickByType(filtered, 'breakfast').length > 0 &&
    pickByType(filtered, 'lunch').length > 0 &&
    pickByType(filtered, 'dinner').length > 0

  if (!hasAllTypes) {
    filtered = MEAL_DATASET.filter((meal) => {
      if (!meal.ageTypes.includes(ageType)) return false
      if (blockedAllergens.length > 0) {
        return !meal.allergens.some((allergen) => blockedAllergens.includes(allergen))
      }
      return true
    })
  }

  const populationSize = 12
  const generations = 18
  let population = Array.from({ length: populationSize }, () => createChromosome(filtered))

  for (let step = 0; step < generations; step += 1) {
    const ranked = population
      .map((genes) => ({
        genes,
        score: chromosomeFitness(genes, preference, ageType, blockedAllergens)
      }))
      .sort((a, b) => b.score - a.score)

    const elite = ranked.slice(0, 4).map((row) => row.genes)
    const nextPopulation = [...elite]

    while (nextPopulation.length < populationSize) {
      const parentA = randomItem(elite)
      const parentB = randomItem(elite)
      let child = crossover(parentA, parentB)
      if (Math.random() < 0.35) {
        child = mutate(child, filtered)
      }
      nextPopulation.push(child)
    }

    population = nextPopulation
  }

  const best = population
    .map((genes) => ({
      genes,
      score: chromosomeFitness(genes, preference, ageType, blockedAllergens)
    }))
    .sort((a, b) => b.score - a.score)[0]

  return {
    preference,
    ageType,
    allergies: blockedAllergens,
    suggestions: {
      breakfast: best.genes.find((meal) => meal.mealType === 'breakfast'),
      lunch: best.genes.find((meal) => meal.mealType === 'lunch'),
      dinner: best.genes.find((meal) => meal.mealType === 'dinner')
    }
  }
}

module.exports = {
  MEAL_DATASET,
  generatePersonalizedMeals
}
