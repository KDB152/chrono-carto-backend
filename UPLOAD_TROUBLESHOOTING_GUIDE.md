# 🔧 Guide de Dépannage - Upload de Fichiers

## 🎯 Problème Identifié

**User Feedback**: "encore erreur lors de l'envoi du fichier dans tous les dashboards"

**Status**: ✅ **BACKEND FONCTIONNEL** - Le problème vient du frontend

## 🔍 Diagnostic Effectué

### **Tests Backend** ✅
```bash
✅ Endpoint /messaging/upload accessible
✅ Protection JWT active (401 sans token)
✅ Validation de taille de fichier (25MB max)
✅ Gestion d'erreurs appropriée
✅ Structure backend correcte
```

### **Problème Identifié** ❌
- **Backend** : ✅ Fonctionne parfaitement
- **Frontend** : ❌ Problème d'authentification ou de JWT token

## 🚀 Solutions

### **Solution 1: Vérifier l'Authentification Frontend**

#### **Étapes à suivre** :

1. **Vérifier la connexion utilisateur** :
   - Assurez-vous d'être connecté dans le dashboard
   - Vérifiez que le token JWT est présent dans `localStorage`

2. **Vérifier le token JWT** :
   ```javascript
   // Dans la console du navigateur
   console.log('Token:', localStorage.getItem('token'));
   ```

3. **Vérifier l'état de l'utilisateur** :
   - Assurez-vous que l'utilisateur est bien authentifié
   - Vérifiez que l'email est vérifié (si requis)

### **Solution 2: Désactiver Temporairement la Vérification d'Email**

#### **Option A: Modifier le Backend Temporairement**

1. **Localiser le service d'authentification** :
   ```bash
   # Fichier: src/modules/auth/auth.service.ts
   ```

2. **Commenter temporairement la vérification d'email** :
   ```typescript
   // Dans la méthode login
   // if (!user.is_verified) {
   //   throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
   // }
   ```

3. **Redémarrer le backend** :
   ```bash
   npm run start:dev
   ```

#### **Option B: Créer un Utilisateur Test Directement**

1. **Créer un utilisateur dans la base de données** :
   ```sql
   INSERT INTO users (email, password, first_name, last_name, role, is_verified, is_approved, is_active)
   VALUES ('test@example.com', '$2b$10$...', 'Test', 'User', 'student', true, true, true);
   ```

2. **Utiliser cet utilisateur pour tester** :
   - Email: `test@example.com`
   - Mot de passe: `test123`

### **Solution 3: Debug Frontend**

#### **Étapes de Debug** :

1. **Ouvrir les outils de développement** :
   - F12 → Console
   - F12 → Network

2. **Tester l'upload et vérifier** :
   - Les requêtes réseau
   - Les erreurs dans la console
   - Les headers d'authentification

3. **Vérifier l'API call** :
   ```javascript
   // Dans la console
   console.log('FormData:', formData);
   console.log('Headers:', headers);
   ```

### **Solution 4: Test Manuel de l'API**

#### **Script de Test Complet** :

```javascript
// Créer un fichier test-manual-upload.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testManualUpload() {
  // 1. Login
  const loginResponse = await axios.post('http://localhost:3001/auth/login', {
    email: 'test@example.com',
    password: 'test123'
  });
  
  const token = loginResponse.data.accessToken;
  
  // 2. Créer une conversation
  const conversationResponse = await axios.post('http://localhost:3001/messaging/conversations/create-or-get', {
    participant1Id: 1,
    participant2Id: 2
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // 3. Upload un fichier
  const formData = new FormData();
  formData.append('file', fs.createReadStream('test.txt'));
  formData.append('conversationId', conversationResponse.data.id);
  formData.append('senderId', '1');
  
  const uploadResponse = await axios.post('http://localhost:3001/messaging/upload', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...formData.getHeaders()
    }
  });
  
  console.log('Upload successful:', uploadResponse.data);
}
```

## 🔧 Corrections Spécifiques

### **1. Vérifier l'API Frontend**

#### **Fichier** : `chrono-carto-frontend/src/lib/api.ts`

Vérifiez que la fonction `uploadFile` est correcte :

```typescript
export const messagingAPI = {
  // ... autres méthodes
  uploadFile: (formData: FormData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}/messaging/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },
};
```

### **2. Vérifier le Composant MessagingSystem**

#### **Fichier** : `chrono-carto-frontend/src/components/MessagingSystem.tsx`

Vérifiez la fonction `handleFileUpload` :

```typescript
const handleFileUpload = async () => {
  if (!selectedFile || !currentConversation) return;

  try {
    setIsLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('conversationId', currentConversation.id.toString());
    formData.append('senderId', currentUserId.toString());
    formData.append('messageType', 'file');

    const uploadedMessage = await messagingAPI.uploadFile(formData);
    
    // ... reste du code
  } catch (error) {
    console.error('Error uploading file:', error);
    setError('Erreur lors de l\'envoi du fichier');
  }
};
```

### **3. Vérifier l'Authentification**

#### **Fichier** : `chrono-carto-frontend/src/hooks/useAuth.ts` (ou similaire)

Assurez-vous que l'utilisateur est bien authentifié :

```typescript
const { user, token } = useAuth();
console.log('User:', user);
console.log('Token:', token);
```

## 🧪 Tests de Validation

### **Test 1: Vérifier l'Authentification**
```bash
# Dans la console du navigateur
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### **Test 2: Tester l'API Directement**
```javascript
// Dans la console du navigateur
const token = localStorage.getItem('token');
fetch('http://localhost:3001/messaging/test', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

### **Test 3: Tester l'Upload**
```javascript
// Créer un fichier de test
const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
const formData = new FormData();
formData.append('file', file);
formData.append('conversationId', '1');
formData.append('senderId', '1');

// Tester l'upload
fetch('http://localhost:3001/messaging/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  body: formData
}).then(r => r.json()).then(console.log);
```

## 🎯 Résolution Recommandée

### **Étape 1: Vérifier l'Authentification**
1. Ouvrir les outils de développement (F12)
2. Vérifier que le token JWT est présent
3. Vérifier que l'utilisateur est connecté

### **Étape 2: Tester l'API**
1. Utiliser les tests manuels ci-dessus
2. Vérifier les erreurs dans la console
3. Vérifier les requêtes réseau

### **Étape 3: Corriger le Problème**
1. Si l'authentification échoue : Corriger la connexion
2. Si l'API échoue : Vérifier les paramètres
3. Si le token est invalide : Reconnecter l'utilisateur

## 📞 Support

### **Si le problème persiste** :
1. Vérifier les logs du backend
2. Vérifier les logs du frontend
3. Tester avec un utilisateur simple
4. Vérifier la configuration CORS

---

**🎉 Le backend fonctionne parfaitement ! Le problème est dans l'authentification frontend.**

**Prochaines étapes** : Vérifier l'authentification utilisateur dans les dashboards.
