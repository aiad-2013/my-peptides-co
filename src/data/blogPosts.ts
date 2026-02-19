export interface BlogPost {
  id: string;
  title: string;
  category: 'sarms' | 'peptides';
  image: string;
  date?: string;
  excerpt?: string;
  url: string;
}

export const blogPosts: BlogPost[] = [
  // === Learn About SARMs ===
  {
    id: 'melanotan-ii-vs-pt-141',
    title: 'Melanotan II vs PT-141: What Is the Difference?',
    category: 'sarms',
    image: 'https://vicorpus.com/wp-content/uploads/2025/11/Vi-Corpus-Blog-Featured-Image.jpg',
    url: 'https://vicorpus.com/melanotan-ii-vs-pt-141/',
  },
  {
    id: 'tesamorelin-vs-cjc-1295',
    title: 'Tesamorelin vs CJC-1295: Comparing Two Growth Hormone Releasing Peptides',
    category: 'sarms',
    image: 'https://vicorpus.com/wp-content/uploads/2025/11/Vi-Corpus-Blog-Featured-Image.jpg',
    url: 'https://vicorpus.com/tesamorelin-vs-cjc-1295/',
  },
  {
    id: 'klow-vs-glow-peptide',
    title: "What's the Difference Between KLOW and GLOW Peptide?",
    category: 'sarms',
    image: 'https://vicorpus.com/wp-content/uploads/2025/11/Vi-Corpus-Blog-Featured-Image.jpg',
    url: 'https://vicorpus.com/klow-vs-glow-peptide/',
  },
  {
    id: 'post-cycle-therapy-pct-guide',
    title: 'Post Cycle Therapy (PCT) Guide',
    category: 'sarms',
    image: 'https://vicorpus.com/wp-content/uploads/2025/11/Vi-Corpus-Blog-Featured-Image.jpg',
    date: 'October 13, 2025',
    url: 'https://vicorpus.com/post-cycle-therapy-pct-guide/',
  },
  {
    id: 'what-is-testosterone',
    title: 'What Is Testosterone?',
    category: 'sarms',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    date: 'March 3, 2025',
    url: 'https://vicorpus.com/what-is-testosterone/',
  },
  {
    id: 'laxogenin-and-its-crucial-benefits',
    title: 'Understanding Laxogenin and Its Four Crucial Benefits',
    category: 'sarms',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    date: 'February 25, 2022',
    url: 'https://vicorpus.com/laxogenin-and-its-crucial-benefits/',
  },
  {
    id: 'sarms-health-benefits',
    title: 'What You Need to Know About SARMs and Their Health Benefits',
    category: 'sarms',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    date: 'February 17, 2022',
    url: 'https://vicorpus.com/what-you-need-to-know-about-sarms-and-their-health-benefits/',
  },

  // === Learn About Peptides ===
  {
    id: 'breathe-effectively-during-exercise',
    title: 'How to Breathe Effectively During Exercise (7 Tips)',
    category: 'peptides',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    url: 'https://vicorpus.com/breathe-effectively-during-exercise/',
  },
  {
    id: 'incidental-exercise-benefits',
    title: "Stop Missing Out on Incidental Exercise's Benefits Today",
    category: 'peptides',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    url: 'https://vicorpus.com/stop-missing-incidental-exercises-benefits/',
  },
  {
    id: 'hormones-after-working-out',
    title: 'Hormones Released after Working Out and How They Benefit You',
    category: 'peptides',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    url: 'https://vicorpus.com/hormones-benefits-released-after-working-out/',
  },
  {
    id: 'benefits-strength-training',
    title: 'Exercise & Depression: The Benefits of Strength Training',
    category: 'peptides',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    date: 'July 27, 2022',
    url: 'https://vicorpus.com/benefits-strength-training/',
  },
  {
    id: 'exercise-relieve-anxiety',
    title: 'How Does Regular Exercise Help Relieve Anxiety Symptoms?',
    category: 'peptides',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    date: 'July 21, 2022',
    url: 'https://vicorpus.com/regular-exercise-relieve-anxiety-symptoms/',
  },
  {
    id: 'sleep-athletic-performance',
    title: 'Why Sleep is So Important to Improving Athletic Performance',
    category: 'peptides',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    date: 'June 9, 2022',
    url: 'https://vicorpus.com/sleep-importance-improve-athletic-performance/',
  },
  {
    id: 'personal-fitness-trainer',
    title: 'Why You Need the Help of a Personal Fitness Trainer',
    category: 'peptides',
    image: 'https://vicorpus.com/wp-content/uploads/2024/05/Ligandrol-LGD-4033-Benefits-Uses-Side-Effects.jpg',
    date: 'May 30, 2022',
    url: 'https://vicorpus.com/need-help-of-personal-fitness-trainer/',
  },
];
