export interface DrinkFixture {
  name: string
  description: string
  pdp_description: string
  ingredients: string[]
  fun_fact: string | null
  photo_url: string
  source_url: string
  is_available: boolean
  display_order: number
}

export const SOURCED_MENU_DRINKS: DrinkFixture[] = [
  {
    name: 'Maia',
    description: 'Shochu, pineapple, yuzu, and basil in a chilled coupe.',
    pdp_description:
      "Takuma Watanabe's elegant Martiny's cocktail leans into the floral, citrusy side of barley-based iichiko Saiten shochu with pineapple, yuzu, and basil syrup.",
    ingredients: [
      '1 1/2 oz. iichiko Saiten shochu',
      '2 oz. pineapple juice',
      '1/2 oz. yuzu juice',
      '1/2 oz. basil syrup',
    ],
    fun_fact:
      'Shochu depends on koji mold, which turns grain starches into sugars during fermentation.',
    photo_url: 'https://imbibemagazine.com/wp-content/uploads/2024/04/maia-shochu-cocktail-crdt-alex-staniloff.jpg',
    source_url: 'https://imbibemagazine.com/recipe/maia-from-martinys/',
    is_available: true,
    display_order: 0,
  },
  {
    name: 'Ramble',
    description: 'Gin, blackberry, cinnamon, and yuzu over crushed ice.',
    pdp_description:
      "This Collins-style ramble from NO BAR highlights gin's botanicals with bright yuzu, earthy cinnamon syrup, and muddled blackberries.",
    ingredients: [
      '2 oz. gin',
      '3/4 oz. cinnamon syrup',
      '3/4 oz. yuzu juice',
      '2 blackberries',
      '2 blackberries, for garnish',
    ],
    fun_fact:
      'Yuzu peel is so aromatic that bartenders often prize it almost as much as the juice.',
    photo_url: 'https://imbibemagazine.com/wp-content/uploads/2019/05/the-ramble-yuzu-cocktail-no-bar-vertical-crdt-markus-marty.jpg',
    source_url: 'https://imbibemagazine.com/recipe/yuzu-cocktail-ramble/',
    is_available: true,
    display_order: 1,
  },
  {
    name: 'Blood Orange Vodka',
    description: 'Bright blood orange vodka topped with sparkling water.',
    pdp_description:
      'A light, refreshing vodka cocktail with blood orange juice, fresh sage, and sparkling water for a crisp winter-citrus finish.',
    ingredients: [
      '1 tbsp water',
      '1/2 tbsp granulated sugar',
      '1-2 long peels from 1 blood orange',
      '2 sage leaves',
      '1 pinch kosher salt',
      '1 shot vodka',
      '1/3 cup blood orange juice',
      'Ice',
      '1/2 cup sparkling water',
      '1 sage leaf and 1 blood orange slice, for garnish',
    ],
    fun_fact:
      'Blood orange season starts in December, which is why this drink reads so wintry.',
    photo_url: 'https://deliciousnotgorgeous.com/wp-content/uploads/2022/12/Blood-Orange-Vodka_1306_sq1.jpg',
    source_url: 'https://deliciousnotgorgeous.com/blood-orange-vodka/',
    is_available: true,
    display_order: 2,
  },
  {
    name: 'Melona Soju',
    description: 'Creamy honeydew popsicle, soju, soda, lime, and ice.',
    pdp_description:
      'A creamy, fruity highball built around a honeydew Melona bar, soju, lemon-lime soda, and a squeeze of lime.',
    ingredients: [
      'Ice',
      '1 Melona bar',
      '1 shot soju (or 3 tbsp)',
      '1/2 cup lemon-lime soda',
      '1 pinch kosher salt',
      '1 lime wedge',
    ],
    fun_fact:
      'Melona bars also come in strawberry, banana, coconut, and mango flavors.',
    photo_url: 'https://deliciousnotgorgeous.com/wp-content/uploads/2018/02/MelonaSoju_9607_sq1.jpg',
    source_url: 'https://deliciousnotgorgeous.com/melona-soju/',
    is_available: true,
    display_order: 3,
  },
  {
    name: 'Yuzu Sour',
    description: 'Japanese whisky, yuzu, Cynar, and star anise spice.',
    pdp_description:
      "A Japanese-inspired Whisky Sour where yuzu's floral tartness meets Japanese whisky, Cynar, and warm star anise syrup.",
    ingredients: [
      '1 1/2 oz. Japanese whisky',
      '3/4 oz. Cynar',
      '3/4 oz. yuzu juice',
      '1/2 oz. star anise syrup',
      '3 drops sarsaparilla bitters (optional)',
      '1 toasted star anise pod, for garnish',
    ],
    fun_fact:
      'Yuzu reached Japan more than 1,000 years ago and is still widely grown there.',
    photo_url: 'https://imbibemagazine.com/wp-content/uploads/2022/11/Yuzu-Sour-crdt-Julie-Soefer.jpg',
    source_url: 'https://imbibemagazine.com/recipe/yuzu-sour/',
    is_available: true,
    display_order: 4,
  },
  {
    name: 'Un Americano',
    description: 'Tequila, Salers, blanc vermouth, and lime-yuzu soda.',
    pdp_description:
      "Ignacio Jimenez's bright aperitif-style drink layers blanco tequila, Salers, blanc vermouth, and lime-yuzu soda.",
    ingredients: [
      '1/2 oz. blanco tequila',
      '3/4 oz. Salers Aperitif',
      '3/4 oz. Dolin Blanc Vermouth',
      'Fever-Tree Sparkling Lime and Yuzu, to top',
    ],
    fun_fact:
      'This is a tequila-and-yuzu riff on the classic Americano aperitif template.',
    photo_url: 'https://imbibemagazine.com/wp-content/uploads/2021/04/un-americano-nacho-jimenez.jpg',
    source_url: 'https://imbibemagazine.com/recipe/un-americano/',
    is_available: true,
    display_order: 5,
  },
]
