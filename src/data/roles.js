export const ALL_ROLES = [
  {
    id: 'captain',
    name: 'Капитан',
    icon: '👑',
    color: '#eab308', // gold
    desc: 'Стратегическое лидерство и командование'
  },
  {
    id: 'strength',
    name: 'Сила',
    icon: '💪',
    color: '#ef4444', // red
    desc: 'Физическая мощь и сокрушительный удар'
  },
  {
    id: 'intelligence',
    name: 'Интеллект',
    icon: '🧠',
    color: '#3b82f6', // blue
    desc: 'Гениальность, изобретения и логика'
  },
  {
    id: 'magic',
    name: 'Магическая сила',
    icon: '🔮',
    color: '#a855f7', // purple
    desc: 'Мистическая энергия и заклинания'
  },
  {
    id: 'ranged',
    name: 'Дальний бой',
    icon: '🎯',
    color: '#06b6d4', // cyan
    desc: 'Меткость, снайперство и бластеры'
  },
  {
    id: 'agility',
    name: 'Ловкость',
    icon: '⚡',
    color: '#10b981', // green
    desc: 'Скорость, рефлексы и акробатика'
  },
  {
    id: 'sum',
    name: 'Сумма всех характеристик',
    icon: '🏆',
    color: '#f97316', // orange
    desc: 'Общий суммарный показатель силы персонажа'
  }
];

export const getRoleById = (id) => ALL_ROLES.find(r => r.id === id);
