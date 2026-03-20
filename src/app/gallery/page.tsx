import { redirect } from 'next/navigation'

// Gallery page removed to save storage — redirect visitors to homepage
export default function GalleryPage() {
  redirect('/')
}
