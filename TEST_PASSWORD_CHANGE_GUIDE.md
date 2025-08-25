# 🔐 Guide de Test - Changement de Mot de Passe

## ✅ Backend Testé et Fonctionnel

Le backend a été testé et fonctionne parfaitement :
- ✅ Login réussi
- ✅ Vérification du mot de passe actuel (rejette les mots de passe incorrects)
- ✅ Changement de mot de passe réussi
- ✅ Persistance en base de données
- ✅ Nouveau mot de passe fonctionne

## 🚀 Comment Tester le Frontend

### **1. Démarrer les Services**

**Backend** (déjà démarré) :
```bash
cd chrono-carto-backend
npm run start:dev
```

**Frontend** (déjà démarré) :
```bash
cd chrono-carto-frontend
npm run dev
```

### **2. Se Connecter au Dashboard**

1. **Ouvrir le navigateur** : `http://localhost:3000`
2. **Se connecter** :
   - Email : `mehdielabed69@gmail.com`
   - Mot de passe : `password123`

### **3. Tester le Changement de Mot de Passe**

1. **Aller dans les paramètres** :
   - Cliquer sur l'onglet "Paramètres"

2. **Changer le mot de passe** :
   - Cliquer sur "Changer le mot de passe"
   - Remplir les champs :
     - **Mot de passe actuel** : `password123`
     - **Nouveau mot de passe** : `newpassword123`
     - **Confirmation** : `newpassword123`
   - Cliquer sur "Changer"

3. **Vérifier les logs** :
   - Ouvrir la console du navigateur (F12)
   - Vérifier les logs de débogage

### **4. Vérifier le Résultat**

1. **Message de succès** : "Mot de passe modifié avec succès"
2. **Se déconnecter**
3. **Se reconnecter** avec le nouveau mot de passe : `newpassword123`

## 🔍 Debug Frontend

### **Logs à Vérifier dans la Console** :
```javascript
🔍 Debug - Token exists: true
🔍 Debug - Token (first 50 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔍 Debug - Current password: password123
🔍 Debug - New password: newpassword123
🔍 Debug - API Response: { message: 'Mot de passe modifié avec succès' }
```

### **Si Erreur** :
```javascript
🔍 Debug - Error details: [détails de l'erreur]
🔍 Debug - Error message: [message d'erreur]
```

## 🎯 Résultat Attendu

### **Comportement Correct** :
1. ✅ Le mot de passe actuel est vérifié
2. ✅ Le nouveau mot de passe est accepté
3. ✅ Le mot de passe est modifié en base de données
4. ✅ L'ancien mot de passe ne fonctionne plus
5. ✅ Le nouveau mot de passe fonctionne
6. ✅ Les messages d'erreur sont appropriés

## 🚨 Si le Problème Persiste

### **Vérifications** :
1. **Token présent** : Vérifier que le token est dans localStorage
2. **Requête envoyée** : Vérifier que la requête est envoyée au backend
3. **Réponse reçue** : Vérifier la réponse du backend
4. **Erreurs** : Vérifier les erreurs éventuelles

### **Commandes de Debug** :
```bash
# Vérifier que le backend répond
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mehdielabed69@gmail.com","password":"password123"}'

# Vérifier l'endpoint change-password
curl -X POST http://localhost:3001/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"currentPassword":"password123","newPassword":"newpassword123"}'
```

---

**Status** : ✅ **Backend Fonctionnel** - Le problème est dans le frontend
