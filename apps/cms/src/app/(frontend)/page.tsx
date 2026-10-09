import Link from "next/link";

export default function CmsHomePage() {
  return (
    <>
      <h1>Portal San Pablo — CMS</h1>
      <p>
        Panel de administración: <Link href="/admin">/admin</Link>
      </p>
    </>
  );
}
