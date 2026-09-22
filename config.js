// ============================================================
// CONFIGURATION DU QUIZ — à adapter pour chaque module
// ============================================================
const QUIZ_CONFIG = {
  // Nom du module affiché en haut de la page
  moduleName: "Computer Vision",

  // Durée du quiz en minutes (adapte selon le nombre de questions)
  dureeMinutes: 10,

  // Points attribués par bonne réponse
  pointsParQuestion: 0.25,

  // URL du Google Apps Script (Web App) qui reçoit les réponses.
  // Voir README.md pour la procédure de création — à remplacer par TON URL
  // une fois le script déployé, sinon les réponses ne seront pas enregistrées.
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbzKngt2RTBZ2KJQQfhOVpYgwECN12-PF_n9qpy_gKDLeJgN3xxyY35i6qugkWW_5yzz/exec"
};
