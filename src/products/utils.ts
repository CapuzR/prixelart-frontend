export const splitDescription = (
  description: string | undefined
): { generalDescription: string; technicalSpecification: string } => {
  const technicalKeyword = "ESPECIFICACIÓN TÉCNICA";

  if (!description || !description.includes(technicalKeyword)) {
    return {
      generalDescription: description || "",
      technicalSpecification: "",
    };
  }

  const [generalDescription, technicalSpecification] = description.split(
    technicalKeyword
  );

  // Clean up leading/trailing ** in technicalSpecification, if present
  const cleanedTechnicalSpecification = technicalSpecification
    .trim()
    .replace(/^\*\*/, "") // Remove leading **
    .replace(/\*\*$/, ""); // Remove trailing **

  const cleanedGeneralDescription = generalDescription
    .trim()
    .replace(/^\*\*/, "") // Remove leading **
    .replace(/\*\*$/, ""); // Remove trailing **

  return {
    generalDescription: cleanedGeneralDescription.trim(),
    technicalSpecification: cleanedTechnicalSpecification.trim(),
  };
};
