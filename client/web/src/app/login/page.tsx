import LoginForm from '@/components/forms/LoginForm'
import ContentWrapper from '@/components/layout/ContentWrapper'

export default function LoginPage() {
  return (
    <ContentWrapper className="flex justify-center w-full">
      <div className="flex min-h-screen items-center w-full justify-center">
        <LoginForm />
      </div>
    </ContentWrapper>
  )
}
