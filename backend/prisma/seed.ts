import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const services = [
  { name: 'Garde du corps VIP', description: 'Protection rapprochée haut de gamme pour VIP, cadres, et célébrités.', category: 'Protection VIP', basePrice: 500, duration: 480, rating: 4.9, available: true, image: 'https://images.unsplash.com/photo-1544022485-6bb04439c73d?w=800&q=80' },
  { name: 'Escorte Sécurisée', description: 'Accompagnement et protection lors de vos déplacements critiques.', category: 'Protection VIP', basePrice: 300, duration: 240, rating: 4.8, available: true, image: 'https://images.unsplash.com/photo-1596773383049-7ecb6cc4ddea?w=800&q=80' },
  { name: 'Sécurité Événementielle', description: 'Contrôle d\'accès et sécurisation globale pour vos événements.', category: 'Sécurité Événementielle', basePrice: 400, duration: 360, rating: 4.7, available: true, image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80' },
  { name: 'Installation Caméras', description: 'Déploiement de caméras CCTV dernière génération.', category: 'Vidéosurveillance', basePrice: 800, duration: 240, rating: 4.8, available: true, image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80' },
  { name: 'Audit Vidéo', description: 'Inspection complète de vos systèmes de surveillance.', category: 'Vidéosurveillance', basePrice: 150, duration: 120, rating: 4.5, available: true, image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=800&q=80' },
  { name: 'Pénétration Test', description: 'Test de vos infrastructures réseaux contre les attaques.', category: 'Cybersécurité', basePrice: 1000, duration: 480, rating: 4.9, available: true, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
  { name: 'Sécurisation Web', description: 'Protection de vos applications web et bases de données.', category: 'Cybersécurité', basePrice: 750, duration: 300, rating: 4.6, available: true, image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80' },
  { name: 'Chauffeur Blindé', description: 'Transfert sécurisé en véhicule blindé anti-agression.', category: 'Transport Sécurisé', basePrice: 600, duration: 180, rating: 4.8, available: true, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80' },
  { name: 'Analyse des risques', description: 'Évaluation des vulnérabilités de vos locaux.', category: 'Audit et Conseil', basePrice: 450, duration: 240, rating: 4.7, available: true, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80' },
  { name: 'Formation Sécurité', description: 'Formation de vos employés aux gestes de premier secours et sécurité.', category: 'Audit et Conseil', basePrice: 200, duration: 360, rating: 4.4, available: true, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80' },
];

async function main() {
  console.log('Cleaning database...');
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database with 10 EliteForce services...');

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('Admin@123', salt);

  await prisma.user.create({
    data: {
      email: 'admin@eliteforce.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'EliteForce',
      role: 'ADMIN',
      phone: '+212600000000'
    },
  });

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
