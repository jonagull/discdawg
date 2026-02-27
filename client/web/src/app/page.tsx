'use client'

import { useAuthCheck } from '@shared'
import ContentWrapper from '@/components/layout/ContentWrapper'

export default function Home() {
  useAuthCheck()

  return (
    <ContentWrapper>
      <div className="max-w-4xl mx-auto text-center space-y-6 py-12">
        <h1 className="text-5xl font-bold">Hello World!</h1>
        <p className="text-xl text-muted-foreground">
          Your full-stack application is ready to go. Start building your features!
        </p>
        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            Check out the{' '}
            <a href="/docs" className="text-blue-600 hover:underline">
              docs
            </a>{' '}
            to learn how to add new features, or view the{' '}
            <a href="/structure" className="text-blue-600 hover:underline">
              project structure
            </a>
            .
          </p>
        </div>
      </div>
    </ContentWrapper>
  )
}
