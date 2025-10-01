import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrixerProfile from '../artist/profile/index';

export default function LegacyOrProfileRouter() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  console.log(slug);

  useEffect(() => {
    if (!slug) return;

    if (slug.startsWith('art=')) {
      const artId = slug.substring(4);
      console.log(`URL de arte antigua. Redirigiendo a /arte/${artId}`);
      navigate(`/arte/${artId}`, { replace: true });
    }
    else {
      console.log(`URL de perfil corta. Redirigiendo a /prixer/${slug}`);
      navigate(`/prixer/${slug}`, { replace: true });
    }
  }, [slug, navigate]);

  return <h1>Cargando...</h1>;
}
