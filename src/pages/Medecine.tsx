import { useState } from "react";

const EssentialMedicines = () => {
  const medicines = [
    { name: "Paracétamol (Doliprane, Dafalgan)", category: "Analgésique", usage: "Soulage la fièvre et la douleur légère à modérée.", price: "500 - 2500 FCFA", symptoms: ["Fièvre", "Douleur modérée"], details: "Disponible en comprimés et en sirop pour enfants. À ne pas dépasser 3g par jour pour un adulte." },
    { name: "Antiseptiques (Bétadine, alcool, Dakin)", category: "Désinfectant", usage: "Désinfection des plaies pour éviter les infections.", price: "1000 - 3000 FCFA", symptoms: ["Infections", "Plaies"], details: "Utiliser localement sur les plaies après lavage avec de l'eau propre." },
    { name: "Ibuprofène (Advil, Nurofen)", category: "Anti-inflammatoire", usage: "Anti-inflammatoire et antidouleur puissant.", price: "1500 - 3500 FCFA", symptoms: ["Inflammation", "Douleur intense"], details: "Ne pas utiliser chez les personnes ayant des ulcères gastriques. À prendre après un repas." },
    { name: "Charbon actif (Carbolevure, Norit)", category: "Antidiarrhéique", usage: "Utilisé en cas d'intoxication alimentaire légère.", price: "1000 - 2500 FCFA", symptoms: ["Ballonnements", "Diarrhée"], details: "Efficace contre les ballonnements et diarrhées légères. Ne pas utiliser avec d'autres médicaments." },
    { name: "Sérum physiologique", category: "Hygiène", usage: "Nettoyage des yeux, du nez et des plaies.", price: "500 - 1500 FCFA", symptoms: ["Congestion nasale", "Plaies"], details: "Idéal pour l'hygiène nasale des nourrissons et l'hydratation des muqueuses." },
    { name: "Smecta (Diosmectite)", category: "Antidiarrhéique", usage: "Traitement des diarrhées aiguës et ballonnements.", price: "2000 - 4000 FCFA", symptoms: ["Diarrhée aiguë", "Ballonnements"], details: "À prendre avec de l'eau en cas de diarrhée. Peut être utilisé chez les enfants et adultes." },
    { name: "Dafalgan", category: "Analgésique", usage: "Antidouleur et antipyrétique souvent utilisé pour les maux de tête.", price: "2500 - 5000 FCFA", symptoms: ["Maux de tête", "Fièvre"], details: "Alternative au paracétamol, souvent prescrit pour les douleurs modérées." },
    { name: "Anti-diarrhéiques (Imodium, Tiorfan)", category: "Antidiarrhéique", usage: "Réduction des symptômes de la diarrhée aiguë.", price: "2000 - 3500 FCFA", symptoms: ["Diarrhée aiguë"], details: "Utiliser en cas de diarrhée persistante, ne pas dépasser la dose recommandée." },
  ];

  const [selectedCategory, setSelectedCategory] = useState("");
  const [symptomInput, setSymptomInput] = useState("");

  const filteredMedicines = medicines.filter((medicine) => {
    return (
      (selectedCategory ? medicine.category === selectedCategory : true) &&
      (symptomInput ? medicine.symptoms.some(symptom => symptom.toLowerCase().includes(symptomInput.toLowerCase())) : true)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6 pt-12 pb-12">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full text-center border-t-4 border-[#059669]">
        <h1 className="text-2xl font-bold text-[#059669] mb-4">Médicaments Essentiels</h1>
        <p className="text-gray-700 mb-4">
          Voici une liste des médicaments de base à avoir chez soi avec leurs usages, précautions et prix moyens en pharmacie à Abidjan. Utilisez les filtres pour affiner votre recherche.
        </p>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-4">
          <div className="flex items-center">
            <label className="mr-2 text-gray-700">Catégorie:</label>
            <select 
              className="p-2 border rounded w-full"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="Analgésique">Analgésique</option>
              <option value="Anti-inflammatoire">Anti-inflammatoire</option>
              <option value="Antidiarrhéique">Antidiarrhéique</option>
              <option value="Désinfectant">Désinfectant</option>
              <option value="Hygiène">Hygiène</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="mr-2 text-gray-700">Symptômes:</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              placeholder="Ex: Fièvre"
              onChange={(e) => setSymptomInput(e.target.value)}
            />
          </div>
        </div>

        <ul className="space-y-3 text-left">
          {filteredMedicines.map((item, index) => (
            <li key={index} className="bg-[#e6f6f0] p-3 rounded-lg shadow-sm border-l-4 border-[#059669]">
              <span className="font-semibold text-gray-800">{item.name}:</span> {item.usage} <br />
              <span className="text-gray-600">Prix moyen: {item.price}</span><br />
              <span className="text-gray-500 text-sm">{item.details}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EssentialMedicines;
