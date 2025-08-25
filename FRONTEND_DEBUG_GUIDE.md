# 🔍 Guide de Debug Frontend - Changement de Mot de Passe

## ✅ Backend Confirmé Fonctionnel

Le backend a été testé et fonctionne parfaitement :
- ✅ **Vérification du mot de passe actuel** : Rejette les mots de passe incorrects
- ✅ **Changement de mot de passe** : Accepte les mots de passe corrects
- ✅ **Persistance en base de données** : Le mot de passe est modifié
- ✅ **Validation complète** : L'ancien mot de passe ne fonctionne plus

## 🚨 Problème Identifié dans le Frontend

L'utilisateur rapporte que :
1. **La vérification du mot de passe actuel ne fonctionne pas** - il accepte n'importe quel mot de passe
2. **Le changement de mot de passe ne persiste pas** en base de données

## 🔧 Diagnostic à Effectuer

### **1. Vérifier l'État de Connexion**

Ouvrir la page de debug : `chrono-carto-frontend/debug-localStorage.html`

**Vérifications** :
- ✅ **Token présent** dans localStorage (`accessToken`)
- ✅ **User details présents** dans localStorage (`userDetails`)
- ✅ **Token valide** (pas expiré)

### **2. Tester la Connexion**

Dans la page de debug :
1. **Se connecter** avec les identifiants corrects
2. **Vérifier** que le token est stocké
3. **Tester** le changement de mot de passe

### **3. Vérifier les Logs du Frontend**

Dans le navigateur (F12 → Console) :
```javascript
// Logs attendus lors du changement de mot de passe
🔍 Debug - Token exists: true
🔍 Debug - Token (first 50 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔍 Debug - Current password: [mot de passe saisi]
🔍 Debug - New password: [nouveau mot de passe]
🔍 Debug - API Response: { message: 'Mot de passe modifié avec succès' }
```

### **4. Vérifier les Requêtes Réseau**

Dans le navigateur (F12 → Network) :
1. **Filtrer** par "Fetch/XHR"
2. **Tester** le changement de mot de passe
3. **Vérifier** la requête vers `/auth/change-password`
4. **Vérifier** les headers (Authorization, Content-Type)
5. **Vérifier** le body de la requête
6. **Vérifier** la réponse du serveur

## 🛠️ Solutions Possibles

### **Problème 1 : Token Manquant ou Invalide**

**Symptômes** :
- Erreur 401 Unauthorized
- Token non présent dans localStorage

**Solutions** :
```javascript
// Vérifier le token
const token = localStorage.getItem('accessToken');
if (!token) {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
}
```

### **Problème 2 : Requête Non Envoyée**

**Symptômes** :
- Pas de requête dans l'onglet Network
- Erreur JavaScript dans la console

**Solutions** :
```javascript
// Vérifier que la fonction est appelée
console.log('🔍 Debug - Function called');
console.log('🔍 Debug - Token:', !!localStorage.getItem('accessToken'));
```

### **Problème 3 : Mauvaise URL ou Headers**

**Symptômes** :
- Erreur 404 ou 500
- Requête envoyée mais échoue

**Solutions** :
```javascript
// Vérifier l'URL et les headers
const response = await fetch('http://localhost:3001/auth/change-password', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
});
```

### **Problème 4 : CORS ou Problème de Réseau**

**Symptômes** :
- Erreur CORS
- Erreur de réseau

**Solutions** :
- Vérifier que le backend est démarré sur `http://localhost:3001`
- Vérifier la configuration CORS dans le backend

## 📋 Checklist de Diagnostic

### **Étape 1 : Vérifier l'État Initial**
- [ ] Ouvrir `debug-localStorage.html`
- [ ] Vérifier que localStorage est vide
- [ ] Se connecter avec les bons identifiants
- [ ] Vérifier que le token est stocké

### **Étape 2 : Tester le Backend Directement**
- [ ] Utiliser la page de debug pour tester le changement de mot de passe
- [ ] Vérifier que ça fonctionne avec le bon mot de passe
- [ ] Vérifier que ça échoue avec le mauvais mot de passe

### **Étape 3 : Tester le Frontend**
- [ ] Aller sur `http://localhost:3000`
- [ ] Se connecter au dashboard parent
- [ ] Aller dans les paramètres
- [ ] Ouvrir la console (F12)
- [ ] Tester le changement de mot de passe
- [ ] Vérifier les logs de debug

### **Étape 4 : Analyser les Résultats**
- [ ] Comparer les logs frontend avec les logs backend
- [ ] Identifier où le problème se situe
- [ ] Appliquer la solution appropriée

## 🎯 Résultat Attendu

### **Comportement Correct** :
1. ✅ Le token est présent dans localStorage
2. ✅ La requête est envoyée au backend
3. ✅ Le backend vérifie le mot de passe actuel
4. ✅ Le backend rejette les mots de passe incorrects
5. ✅ Le backend accepte les mots de passe corrects
6. ✅ Le mot de passe est modifié en base de données
7. ✅ L'ancien mot de passe ne fonctionne plus
8. ✅ Le nouveau mot de passe fonctionne

---

**Status** : 🔍 **EN COURS DE DIAGNOSTIC** - Le backend fonctionne, le problème est dans le frontend
