// ============================================================
// BANQUE DE QUESTIONS — remplace ce fichier pour changer de module
// ============================================================
// Format : un tableau d'objets { q, opts: {A,B,C,D}, correct: "A"|"B"|"C"|"D" }
// - "opts" peut avoir 3 ou 4 propositions (D est optionnel)
// - "correct" doit correspondre exactement à une des clés de "opts"
// Pour un nouveau module : garde exactement ce format, remplace juste le contenu.

const QUIZ_QUESTIONS = [
  {q:"Qu'est-ce que le prétraitement d'image en vision par ordinateur ?", opts:{
    A:"L'ensemble des opérations appliquées à une image brute avant l'analyse ou l'extraction de caractéristiques",
    B:"La compression finale de l'image pour le stockage",
    C:"L'affichage de l'image sur un écran",
    D:"L'entraînement du modèle de classification"}, correct:"A"},
  {q:"Quel est l'objectif principal du filtrage gaussien ?", opts:{
    A:"Détecter les contours", B:"Réduire le bruit en lissant l'image",
    C:"Augmenter le contraste", D:"Binariser l'image"}, correct:"B"},
  {q:"En traitement d'image, que représente un pixel dans une image en niveaux de gris 8 bits ?", opts:{
    A:"Une valeur entre 0 et 1000", B:"Une valeur entre 0 et 255",
    C:"Une valeur entre -128 et 127 uniquement", D:"Un triplet RGB"}, correct:"B"},
  {q:"Quelle opération morphologique permet de supprimer les petits objets/bruits blancs dans une image binaire ?", opts:{
    A:"La dilatation", B:"L'érosion", C:"L'ouverture (opening)", D:"La fermeture (closing)"}, correct:"C"},
  {q:"Quelle opération morphologique permet de combler les petits trous dans les objets d'une image binaire ?", opts:{
    A:"L'érosion", B:"La fermeture (closing)", C:"L'ouverture (opening)", D:"Le gradient morphologique"}, correct:"B"},
  {q:"Quel est le rôle de l'égalisation d'histogramme (histogram equalization) ?", opts:{
    A:"Réduire la taille du fichier image", B:"Améliorer le contraste global de l'image en redistribuant les niveaux d'intensité",
    C:"Convertir une image couleur en niveaux de gris", D:"Détecter les visages dans l'image"}, correct:"B"},
  {q:"Quel espace colorimétrique sépare la luminance de la chrominance, utile pour des traitements robustes aux variations d'éclairage ?", opts:{
    A:"RGB", B:"HSV / YCrCb", C:"CMJN", D:"Binaire"}, correct:"B"},
  {q:"Quel opérateur est couramment utilisé pour la détection de contours en calculant le gradient de l'image ?", opts:{
    A:"Filtre médian", B:"Sobel", C:"Flou gaussien", D:"Seuillage d'Otsu"}, correct:"B"},
  {q:"Quelle méthode de seuillage détermine automatiquement un seuil optimal en maximisant la variance inter-classe ?", opts:{
    A:"Seuillage adaptatif simple", B:"Seuillage d'Otsu", C:"Seuillage manuel", D:"Seuillage par contours"}, correct:"B"},
  {q:"Quel filtre est particulièrement efficace pour supprimer le bruit « poivre et sel » tout en préservant les contours ?", opts:{
    A:"Filtre gaussien", B:"Filtre médian", C:"Filtre passe-haut", D:"Filtre de Sobel"}, correct:"B"},
  {q:"Que fait l'opérateur de Canny en détection de contours ?", opts:{
    A:"Il applique uniquement un flou gaussien",
    B:"Il combine lissage, calcul du gradient, suppression des non-maxima et seuillage par hystérésis",
    C:"Il convertit l'image en niveaux de gris", D:"Il réalise une égalisation d'histogramme"}, correct:"B"},
  {q:"Pourquoi normalise-t-on souvent les pixels d'une image (ex : valeurs entre 0 et 1) avant de les fournir à un réseau de neurones ?", opts:{
    A:"Pour réduire la résolution de l'image", B:"Pour accélérer et stabiliser l'apprentissage du modèle",
    C:"Pour ajouter du bruit à l'image", D:"Pour convertir l'image en format vidéo"}, correct:"B"},
  {q:"Qu'est-ce que l'augmentation de données (data augmentation) en vision par ordinateur ?", opts:{
    A:"Une technique de compression d'image",
    B:"La génération de nouvelles images d'entraînement par transformations (rotation, flip, zoom, etc.)",
    C:"L'ajout de métadonnées EXIF à l'image", D:"Une méthode de détection d'objets"}, correct:"B"},
  {q:"Quelle est la fonction d'une convolution dans un CNN (réseau de neurones convolutif) ?", opts:{
    A:"Redimensionner l'image en une seule dimension",
    B:"Extraire des caractéristiques locales (contours, textures, motifs) via des filtres appris",
    C:"Trier les pixels par ordre croissant", D:"Compresser l'image sans perte"}, correct:"B"},
  {q:"Quel est l'effet d'une opération de pooling (ex : max pooling) dans un CNN ?", opts:{
    A:"Augmenter la résolution spatiale de l'image",
    B:"Réduire la dimension spatiale tout en conservant les caractéristiques importantes",
    C:"Ajouter du bruit gaussien", D:"Convertir l'image en couleur"}, correct:"B"},
  {q:"En OpenCV (Python), quelle fonction permet de lire une image depuis un fichier ?", opts:{
    A:"cv2.read()", B:"cv2.imread()", C:"cv2.load()", D:"cv2.open()"}, correct:"B"},
  {q:"En OpenCV, quelle fonction convertit une image du format BGR au format RGB ou en niveaux de gris ?", opts:{
    A:"cv2.convert()", B:"cv2.cvtColor()", C:"cv2.transform()", D:"cv2.reshape()"}, correct:"B"},
  {q:"En OpenCV, quelle fonction applique un flou gaussien à une image ?", opts:{
    A:"cv2.medianBlur()", B:"cv2.GaussianBlur()", C:"cv2.Sobel()", D:"cv2.equalizeHist()"}, correct:"B"},
  {q:"En OpenCV, quelle fonction est utilisée pour effectuer un seuillage binaire simple ?", opts:{
    A:"cv2.threshold()", B:"cv2.Canny()", C:"cv2.dilate()", D:"cv2.resize()"}, correct:"A"},
  {q:"Quel est l'intérêt de redimensionner (resize) les images avant de les fournir à un modèle de deep learning ?", opts:{
    A:"Cela n'a aucun impact sur le modèle",
    B:"Garantir une taille d'entrée fixe et cohérente attendue par l'architecture du réseau",
    C:"Supprimer automatiquement le bruit", D:"Améliorer la compression JPEG"}, correct:"B"}
];
