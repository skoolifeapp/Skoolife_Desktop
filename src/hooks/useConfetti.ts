import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F9C74F', '#F4B41A', '#FFD93D', '#FF8C00']
    });
  };

  return { triggerConfetti };
};
