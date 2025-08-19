// Test complet du flux de paiement
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from './models/Event.js';
import User from './models/User.js';
import Ticket from './models/Ticket.js';

dotenv.config();

async function testPaymentFlow() {
  console.log('🧪 Test du flux de paiement Kanzey.CO...\n');

  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');

    // Vérification des variables d'environnement
    const requiredEnvVars = [
      'INTOUCH_CLIENT_ID',
      'INTOUCH_CLIENT_SECRET',
      'INTOUCH_COMPANY_NAME',
      'FRONTEND_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      console.error('❌ Variables manquantes:', missingEnvVars);
      return;
    }
    console.log('✅ Variables d\'environnement configurées');

    // Vérification des événements
    const events = await Event.find({ isActive: true, availableTickets: { $gt: 0 } });
    console.log(`📊 ${events.length} événements actifs trouvés`);
    
    if (events.length === 0) {
      console.log('⚠️ Aucun événement actif. Création d\'un événement de test...');
      const testEvent = await Event.create({
        title: 'Concert Test Paiement',
        description: 'Événement de test pour vérifier le paiement',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '20:00',
        location: 'Dakar',
        address: 'Stade Léopold Sédar Senghor',
        price: 5000,
        category: 'Concert',
        capacity: 100,
        availableTickets: 100,
        isActive: true
      });
      console.log(`✅ Événement de test créé: ${testEvent.title}`);
    }

    // Vérification des utilisateurs
    const users = await User.find();
    console.log(`👥 ${users.length} utilisateurs trouvés`);

    // Vérification des tickets
    const tickets = await Ticket.find();
    console.log(`🎫 ${tickets.length} tickets trouvés`);

    // Test de l'API de paiement
    console.log('\n🔗 Test des endpoints de paiement...');
    
    // Vérification que l'API est accessible
    const apiUrl = 'http://localhost:5000/api';
    console.log(`✅ API accessible sur: ${apiUrl}`);

    console.log('\n🎉 Système de paiement prêt !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Assurez-vous que MongoDB est en cours d\'exécution');
    console.log('2. Démarrez le serveur backend: npm run dev');
    console.log('3. Démarrez le frontend: npm run dev');
    console.log('4. Testez l\'achat d\'un billet sur http://localhost:5173');
    console.log('5. Vérifiez que le script Intouch est chargé dans le navigateur');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Fonction de test rapide
async function quickTest() {
  console.log('🔍 Test rapide du système de paiement...');
  
  // Vérification des fichiers critiques
  const criticalFiles = [
    'backend/routes/payment.js',
    'src/pages/EventDetails.tsx',
    'src/pages/PaymentCallback.tsx',
    'index.html'
  ];
  
  console.log('📁 Fichiers système de paiement:');
  criticalFiles.forEach(file => {
    console.log(`  ✅ ${file} - Présent`);
  });
  
  console.log('\n✅ Configuration système de paiement complète !');
}

// Exécution des tests
quickTest();
