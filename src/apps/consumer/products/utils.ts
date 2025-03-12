export const splitDescription = (
  description: string | undefined
): { generalDescription: string; technicalSpecification: string } => {
  if (!description) {
    return { generalDescription: '', technicalSpecification: '' };
  }

  const technicalKeywordWithAsterisks = '**ESPECIFICACIONES TÉCNICAS**';
  const technicalKeyword = 'ESPECIFICACIÓN TÉCNICA';

  let generalDescription = '';
  let technicalSpecification = '';

  if (description.includes(technicalKeywordWithAsterisks)) {
    [generalDescription, technicalSpecification] = description.split(technicalKeywordWithAsterisks);
  } else if (description.includes(technicalKeyword)) {
    [generalDescription, technicalSpecification] = description.split(technicalKeyword);
  } else {
    return { generalDescription: description, technicalSpecification: '' };
  }

  const cleanedGeneralDescription = generalDescription
    .trim()
    .replace(/^\*\*/, '') // Remove leading **
    .replace(/\*\*$/, ''); // Remove trailing **

  const cleanedTechnicalSpecification = technicalSpecification
    .trim()
    .replace(/^\*\*/, '') // Remove leading **
    .replace(/\*\*$/, ''); // Remove trailing **

  return {
    generalDescription: cleanedGeneralDescription,
    technicalSpecification: cleanedTechnicalSpecification,
  };
};
