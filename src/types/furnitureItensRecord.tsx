export const furnitureItems: Record<string, string> = {
  Bed: "Cama",
  Wardrobe: "Guarda-roupa",
  NigthStand: "Criado-mudo",
  Decorations: "Decoração",
  Rug: "Tapete",
  Window: "Persiana",
  TV: "Televisão",
  Eletronics: "Eletrônicos",
  Chair: "Poltrona",
  Desk: "Escrivaninha",
  Bookshelf: "Estante de Livros",
  Shelving: "Estante",
  Nigthstand: "Criado-mudo",

  CoffeeTable: "Mesa de Centro",
  Shelf: "Estante",
  HomeAppliance: "Eletrodoméstico",
  Sofa: "Sofá",
  Lights: "Iluminação",
  Cabinet: "Armário",
  AirConditioner: "Ar Condicionado",
  Decoration: "Decoração",

  Freezer: "Freezer",
  HomeAppliances: "Eletrodomésticos",
  KitchenUtensils: "Utensílios de Cozinha",
  Table: "Mesa de Jantar",
  Sink: "Pia",
  Cooktop: "Cooktop",
  RangeHood: "Coifa",
  KitchenCabinets: "Armários de Cozinha",

  Else: "Outros"
};

// Categorias por cômodo
export const roomCategories = {
  "Quarto Casal": ["Bed", "Wardrobe", "NigthStand", "Decorations", "Rug", "Window", "TV", "Eletronics", "Chair", "Desk", "Shelving", "Bookshelf"],
  "Sala": ["CoffeeTable", "Eletronics", "Shelf", "HomeAppliance", "Window", "Sofa", "Lights", "Cabinet", "Decoration", "AirConditioner", "Rug", "Else"],
  "Cozinha": ["Freezer", "HomeAppliances", "KitchenUtensils", "Table", "Sink", "Cooktop", "RangeHood", "KitchenCabinets", "Else"]
} as const;
