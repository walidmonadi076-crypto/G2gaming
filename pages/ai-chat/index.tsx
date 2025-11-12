
import type { GetStaticProps } from 'next';

// This page is deprecated and no longer in use.
// Returning notFound: true will render a 404 page.
export default function DeprecatedAIChatPage() {
  return null;
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    notFound: true,
  };
};
