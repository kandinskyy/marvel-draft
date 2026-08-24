const rawCharacters = [
  {
    id: 'iron_man',
    name: 'Железный Человек',
    origName: 'Iron Man (Tony Stark)',
    tags: ['Мстители', 'Гений', 'Технологии', 'Герой'],
    avatar: './images/characters/iron_man.svg',
    baseStats: {
      captain: 8800,
      strength: 7200,
      intelligence: 9800,
      magic: 1200,
      ranged: 9200,
      agility: 7800,
    }
  },
  {
    id: 'captain_america',
    name: 'Капитан Америка',
    origName: 'Captain America (Steve Rogers)',
    tags: ['Мстители', 'Лидер', 'Солдат', 'Герой'],
    avatar: './images/characters/captain_america.svg',
    baseStats: {
      captain: 9900,
      strength: 6800,
      intelligence: 7900,
      magic: 1000,
      ranged: 6500,
      agility: 8200,
    }
  },
  {
    id: 'thor',
    name: 'Тор',
    origName: 'Thor Odinson',
    tags: ['Мстители', 'Бог', 'Асгард', 'Герой'],
    avatar: './images/characters/thor.svg',
    baseStats: {
      captain: 8500,
      strength: 9700,
      intelligence: 5400,
      magic: 8600,
      ranged: 8900,
      agility: 7600,
    }
  },
  {
    id: 'hulk',
    name: 'Халк',
    origName: 'Hulk (Bruce Banner)',
    tags: ['Мстители', 'Гамма', 'Мощь', 'Герой'],
    avatar: './images/characters/hulk.svg',
    baseStats: {
      captain: 3200,
      strength: 9900,
      intelligence: 4100,
      magic: 1000,
      ranged: 2000,
      agility: 6200,
    }
  },
  {
    id: 'spider_man',
    name: 'Человек-Паук',
    origName: 'Spider-Man (Peter Parker)',
    tags: ['Паутина', 'Уличный', 'Гений', 'Герой'],
    avatar: './images/characters/spider_man.svg',
    baseStats: {
      captain: 7100,
      strength: 7500,
      intelligence: 8900,
      magic: 1000,
      ranged: 8100,
      agility: 9800,
    }
  },
  {
    id: 'doctor_strange',
    name: 'Доктор Стрэндж',
    origName: 'Doctor Strange (Stephen Strange)',
    tags: ['Магия', 'Мистик', 'Защитник', 'Герой'],
    avatar: './images/characters/doctor_strange.svg',
    baseStats: {
      captain: 8400,
      strength: 4200,
      intelligence: 9400,
      magic: 9900,
      ranged: 8700,
      agility: 6900,
    }
  },
  {
    id: 'scarlet_witch',
    name: 'Алая Ведьма',
    origName: 'Scarlet Witch (Wanda Maximoff)',
    tags: ['Магия Хаоса', 'Мутант', 'Мощь', 'Герой'],
    avatar: './images/characters/scarlet_witch.svg',
    baseStats: {
      captain: 6900,
      strength: 5100,
      intelligence: 7800,
      magic: 9900,
      ranged: 9100,
      agility: 6400,
    }
  },
  {
    id: 'thanos',
    name: 'Танос',
    origName: 'Thanos The Mad Titan',
    tags: ['Космос', 'Злодей', 'Завоеватель', 'Титан'],
    avatar: './images/characters/thanos.svg',
    baseStats: {
      captain: 9600,
      strength: 9800,
      intelligence: 9300,
      magic: 8500,
      ranged: 8400,
      agility: 6800,
    }
  },
  {
    id: 'wolverine',
    name: 'Росомаха',
    origName: 'Wolverine (Logan)',
    tags: ['Люди Икс', 'Мутант', 'Регенерация', 'Герой'],
    avatar: './images/characters/wolverine.svg',
    baseStats: {
      captain: 6500,
      strength: 8400,
      intelligence: 5800,
      magic: 1000,
      ranged: 2500,
      agility: 9100,
    }
  },
  {
    id: 'deadpool',
    name: 'Дэдпул',
    origName: 'Deadpool (Wade Wilson)',
    tags: ['Наемник', 'Оружие', 'Антигерой', 'Комедия'],
    avatar: './images/characters/deadpool.svg',
    baseStats: {
      captain: 4500,
      strength: 7600,
      intelligence: 6200,
      magic: 1000,
      ranged: 8800,
      agility: 9200,
    }
  },
  {
    id: 'black_panther',
    name: 'Чёрная Пантера',
    origName: 'Black Panther (T\'Challa)',
    tags: ['Ваканда', 'Король', 'Вибраниум', 'Герой'],
    avatar: './images/characters/black_panther.svg',
    baseStats: {
      captain: 9200,
      strength: 7900,
      intelligence: 9100,
      magic: 3500,
      ranged: 6400,
      agility: 9400,
    }
  },
  {
    id: 'loki',
    name: 'Локи',
    origName: 'Loki Laufeyson',
    tags: ['Асгард', 'Бог Обмана', 'Магия', 'Антигерой'],
    avatar: './images/characters/loki.svg',
    baseStats: {
      captain: 7800,
      strength: 6500,
      intelligence: 8800,
      magic: 9500,
      ranged: 7400,
      agility: 8100,
    }
  },
  {
    id: 'captain_marvel',
    name: 'Капитан Марвел',
    origName: 'Captain Marvel (Carol Danvers)',
    tags: ['Космос', 'Мстители', 'Энергия', 'Герой'],
    avatar: './images/characters/captain_marvel.svg',
    baseStats: {
      captain: 8700,
      strength: 9500,
      intelligence: 7400,
      magic: 5200,
      ranged: 9600,
      agility: 8900,
    }
  },
  {
    id: 'venom',
    name: 'Веном',
    origName: 'Venom (Eddie Brock)',
    tags: ['Симбиот', 'Антигерой', 'Монстр', 'Сила'],
    avatar: './images/characters/venom.svg',
    baseStats: {
      captain: 4100,
      strength: 9100,
      intelligence: 5200,
      magic: 2100,
      ranged: 4800,
      agility: 8400,
    }
  }
];

export const MARVEL_CHARACTERS = rawCharacters.map(char => {
  const sum = char.baseStats.captain +
    char.baseStats.strength +
    char.baseStats.intelligence +
    char.baseStats.magic +
    char.baseStats.ranged +
    char.baseStats.agility;
  
  return {
    ...char,
    stats: {
      ...char.baseStats,
      sum
    }
  };
});

export const getCharacterById = (id) => MARVEL_CHARACTERS.find(c => c.id === id);
