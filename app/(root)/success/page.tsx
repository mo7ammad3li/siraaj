import { redirect } from 'next/navigation';

export default function SuccessPage() {
  redirect('/profile');
  return null;
}