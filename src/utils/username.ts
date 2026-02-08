const ADJECTIVES = [
    'Quiet', 'Amber', 'Null', 'Swift', 'Bright', 'Silent', 'Blue', 'Red', 'Green', 'Dark', 
    'Light', 'Misty', 'Neon', 'Solar', 'Lunar', 'Cosmic', 'Vivid', 'Pale', 'Hidden', 'Lost',
    'Wild', 'Calm', 'Brave', 'Wise', 'Cool', 'Warm', 'Icy', 'Fiery', 'Rapid', 'Slow'
];

const NOUNS = [
    'River', 'Fox', 'Echo', 'Hawk', 'Wolf', 'Bear', 'Sky', 'Moon', 'Sun', 'Star', 
    'Nebula', 'Comet', 'Orbit', 'Signal', 'Wave', 'Pulse', 'Shadow', 'Spark', 'Cloud', 'Storm',
    'Mountain', 'Valley', 'Ocean', 'Forest', 'Desert', 'Glacier', 'Canyon', 'Reef', 'Island', 'Peak'
];

export const generateUsername = (): string => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}-${num}`;
};
