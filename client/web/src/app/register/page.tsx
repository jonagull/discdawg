import RegisterForm from '@/components/forms/RegisterForm'
import ContentWrapper from '@/components/layout/ContentWrapper'

export default function RegisterPage() {
  return (
    <ContentWrapper className="flex justify-center w-full">
      <div className="flex min-h-screen items-center w-full justify-center">
        <RegisterForm />
      </div>
    </ContentWrapper>
  )
}
