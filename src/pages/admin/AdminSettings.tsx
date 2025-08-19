import React, { useState } from 'react';
import { 
  Settings, 
  CreditCard, 
  Mail, 
  Shield, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      siteName: 'Kanzey.CO',
      siteDescription: 'La première plateforme de billetterie événementielle du Sénégal',
      contactEmail: 'support@kanzey.co',
      contactPhone: '+221 XX XXX XX XX',
      address: 'Dakar, Sénégal'
    },
    payment: {
      intouchClientId: 'KANZ26379',
      intouchClientSecret: '2H7og9Kc2yFTvf0nJK0EoH8yjHynAUPxlauNn5jchsFFchaNeL',
      intouchCompanyName: 'Kanzey.co',
      intouchPaymentUrl: 'https://touchpay.gutouch.net/touchpayv2/script/touchpaynr/prod_touchpay-0.0.1.js'
    },
    email: {
      smtpHost: 'sandbox.smtp.mailtrap.io',
      smtpPort: '2525',
      smtpUser: '72adac95601e47',
      smtpPassword: '59bdb10991b6a0',
      fromEmail: 'noreply@kanzey.co',
      fromName: 'Kanzey.CO'
    },
    security: {
      jwtSecret: 'sama_xam_xam_super_secret_key_2024_senegal_education',
      sessionTimeout: '7',
      maxLoginAttempts: '5',
      enableTwoFactor: false
    }
  });

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'payment', label: 'Paiement', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Paramètres ${section} sauvegardés avec succès`);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du site
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description du site
        </label>
        <textarea
          rows={3}
          value={settings.general.siteDescription}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de contact
          </label>
          <input
            type="email"
            value={settings.general.contactEmail}
            onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone de contact
          </label>
          <input
            type="tel"
            value={settings.general.contactPhone}
            onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adresse
        </label>
        <input
          type="text"
          value={settings.general.address}
          onChange={(e) => updateSetting('general', 'address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
        />
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Configuration Intouch</h4>
        <p className="text-sm text-yellow-700">
          Ces paramètres sont utilisés pour l'intégration avec le système de paiement Intouch.
          Assurez-vous que les informations sont correctes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client ID Intouch
          </label>
          <input
            type="text"
            value={settings.payment.intouchClientId}
            onChange={(e) => updateSetting('payment', 'intouchClientId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Secret Intouch
          </label>
          <div className="relative">
            <input
              type={showSecrets ? 'text' : 'password'}
              value={settings.payment.intouchClientSecret}
              onChange={(e) => updateSetting('payment', 'intouchClientSecret', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
            />
            <button
              type="button"
              onClick={() => setShowSecrets(!showSecrets)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
            >
              {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'entreprise
        </label>
        <input
          type="text"
          value={settings.payment.intouchCompanyName}
          onChange={(e) => updateSetting('payment', 'intouchCompanyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL du script de paiement
        </label>
        <input
          type="url"
          value={settings.payment.intouchPaymentUrl}
          onChange={(e) => updateSetting('payment', 'intouchPaymentUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
        />
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Configuration SMTP</h4>
        <p className="text-sm text-blue-700">
          Configuration pour l'envoi d'emails (confirmations de billets, notifications, etc.)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serveur SMTP
          </label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Port SMTP
          </label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => updateSetting('email', 'smtpPort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom d'utilisateur SMTP
          </label>
          <input
            type="text"
            value={settings.email.smtpUser}
            onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe SMTP
          </label>
          <div className="relative">
            <input
              type={showSecrets ? 'text' : 'password'}
              value={settings.email.smtpPassword}
              onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
            />
            <button
              type="button"
              onClick={() => setShowSecrets(!showSecrets)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
            >
              {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email expéditeur
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom expéditeur
          </label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-800 mb-2">Paramètres de sécurité</h4>
        <p className="text-sm text-red-700">
          Ces paramètres affectent la sécurité de votre application. Modifiez-les avec précaution.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clé secrète JWT
        </label>
        <div className="relative">
          <input
            type={showSecrets ? 'text' : 'password'}
            value={settings.security.jwtSecret}
            onChange={(e) => updateSetting('security', 'jwtSecret', e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
          >
            {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée de session (jours)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tentatives de connexion max
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => updateSetting('security', 'maxLoginAttempts', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.security.enableTwoFactor}
            onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
            className="rounded border-gray-300 text-kanzey-yellow focus:ring-kanzey-yellow"
          />
          <span className="ml-2 text-sm text-gray-700">
            Activer l'authentification à deux facteurs (2FA)
          </span>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-kanzey-black">Paramètres</h1>
          <p className="text-gray-600 mt-2">Configurez les paramètres de votre plateforme</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-kanzey-yellow text-kanzey-black font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3" size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                
                <button
                  onClick={() => handleSave(activeTab)}
                  disabled={loading}
                  className="bg-kanzey-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>

              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;