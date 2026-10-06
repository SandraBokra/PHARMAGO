const Emergency = () => {
  const emergencyNumbers = [
    { service: "SAMU", number: "185" },
    { service: "Pompiers", number: "180" },
    { service: "Police Secours", number: "170" },
    { service: "Gendarmerie", number: "111" },
    { service: "Centre Anti-Poison", number: "144" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6 pt-12 pb-12">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full text-center border-t-4 border-[#059669]">
        <h1 className="text-2xl font-bold text-[#059669] mb-4">Numéros d'Urgence</h1>
        <p className="text-gray-700 mb-4">
          En cas d'urgence, contactez immédiatement l'un des services ci-dessous.
        </p>
        <ul className="space-y-3">
          {emergencyNumbers.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-[#e6f6f0] p-3 rounded-lg shadow-sm border-l-4 border-[#059669]"
            >
              <span className="font-semibold text-gray-800">{item.service}</span>
              <a
                href={`tel:${item.number}`}
                className="text-red-600 font-bold text-lg"
              >
                {item.number}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Emergency;
