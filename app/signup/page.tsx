import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/nextauth';
import SignUp from '@/components/auth/SignUp';

const SignupPage = async() => {
  const user = await getAuthSession()
  if (user) {
    redirect('/')
  }
  return <SignUp/>
}

export default SignupPage