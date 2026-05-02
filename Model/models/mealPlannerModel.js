const MEAL_DATASET = [
  // Breakfast - 15
  {
    id: 'b1',
    name: 'Vegetable Khichuri',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Balanced', 'Gluten-Free'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'b2',
    name: 'Egg Paratha',
    mealType: 'breakfast',
    tags: ['Balanced'],
    ageTypes: ['teen', 'adult'],
    allergens: ['egg', 'gluten']
  },
  {
    id: 'b3',
    name: 'Flattened Rice with Yogurt and Banana',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Balanced', 'Gluten-Free'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: ['dairy']
  },
  {
    id: 'b4',
    name: 'Roti with Mixed Vegetables',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: ['gluten']
  },
  {
    id: 'b5',
    name: 'Suji Halwa',
    mealType: 'breakfast',
    tags: ['Vegetarian'],
    ageTypes: ['child', 'teen', 'adult'],
    allergens: ['gluten', 'dairy']
  },
  {
    id: 'b6',
    name: 'Dal Paratha',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['gluten']
  },
  {
    id: 'b7',
    name: 'Fried Egg with Vegetables',
    mealType: 'breakfast',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['egg']
  },
  {
    id: 'b8',
    name: 'Puffed Rice Salad',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Balanced'],
    ageTypes: ['teen', 'adult'],
    allergens: []
  },
  {
    id: 'b9',
    name: 'Oats with Milk and Banana',
    mealType: 'breakfast',
    tags: ['Vegetarian', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: ['gluten', 'dairy']
  },
  {
    id: 'b10',
    name: 'Vegetable Omelette',
    mealType: 'breakfast',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['egg']
  },
  {
    id: 'b11',
    name: 'Chicken Paratha Roll',
    mealType: 'breakfast',
    tags: ['Balanced'],
    ageTypes: ['teen', 'adult'],
    allergens: ['gluten']
  },
  {
    id: 'b12',
    name: 'Mutton Keema Paratha',
    mealType: 'breakfast',
    tags: ['Balanced'],
    ageTypes: ['adult'],
    allergens: ['gluten']
  },
  {
    id: 'b13',
    name: 'Duck Egg Omelette',
    mealType: 'breakfast',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['egg']
  },
  {
    id: 'b14',
    name: 'Hilsa with Panta',
    mealType: 'breakfast',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: ['hilsa']
  },
  {
    id: 'b15',
    name: 'Chicken Suji Khichuri',
    mealType: 'breakfast',
    tags: ['Balanced'],
    ageTypes: ['child', 'teen', 'adult'],
    allergens: ['gluten']
  },

  // Lunch - 15
  {
    id: 'l1',
    name: 'Rice with Dal and Vegetables',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l2',
    name: 'Chicken Rice with Salad',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l3',
    name: 'Rui Curry with Rice',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l4',
    name: 'Khichuri with Egg',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['egg']
  },
  {
    id: 'l5',
    name: 'Dal Khichuri',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l6',
    name: 'Hilsa Curry',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: []
  },
  {
    id: 'l7',
    name: 'Vegetable Pulao',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l8',
    name: 'Chicken Vegetable Bowl',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l9',
    name: 'Egg Bhuna',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['egg']
  },
  {
    id: 'l10',
    name: 'Chickpea Salad',
    mealType: 'lunch',
    tags: ['Vegetarian', 'Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l11',
    name: 'Mutton Curry',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: []
  },
  {
    id: 'l12',
    name: 'Duck Curry',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: []
  },
  {
    id: 'l13',
    name: 'Pabda Curry',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l14',
    name: 'Katla Curry with Vegetables',
    mealType: 'lunch',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'l15',
    name: 'Biryani',
    mealType: 'lunch',
    tags: ['Balanced'],
    ageTypes: ['teen', 'adult'],
    allergens: []
  },

  // Dinner - 15
  {
    id: 'd1',
    name: 'Lentil Soup',
    mealType: 'dinner',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd2',
    name: 'Chicken Curry with Vegetables',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd3',
    name: 'Rui Curry with Vegetables',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd4',
    name: 'Mixed Vegetable',
    mealType: 'dinner',
    tags: ['Vegetarian', 'Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd5',
    name: 'Egg Curry',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd6',
    name: 'Bottle Gourd with Shrimp',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: ['shellfish']
  },
  {
    id: 'd7',
    name: 'Vegetable Dal',
    mealType: 'dinner',
    tags: ['Vegetarian', 'Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd8',
    name: 'Chicken Soup',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd9',
    name: 'Spinach Dal',
    mealType: 'dinner',
    tags: ['Vegetarian', 'Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd10',
    name: 'Tilapia Curry',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
    allergens: []
  },
  {
    id: 'd11',
    name: 'Mutton Stew with Vegetables',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: []
  },
  {
    id: 'd12',
    name: 'Duck Bhuna',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['adult', 'senior'],
    allergens: []
  },
  {
    id: 'd13',
    name: 'Koi Curry with Vegetables',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['koi']
  },
  {
    id: 'd14',
    name: 'Pangash Curry',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Balanced'],
    ageTypes: ['teen', 'adult', 'senior'],
    allergens: ['pangash']
  },
  {
    id: 'd15',
    name: 'Chicken Vegetable Stew',
    mealType: 'dinner',
    tags: ['Gluten-Free', 'Low-Carb', 'Balanced'],
    ageTypes: ['child', 'teen', 'adult', 'senior'],
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
