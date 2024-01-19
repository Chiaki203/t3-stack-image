import Footer from '@/components/navigation/Footer'
import Image from 'next/image'

const Home = () => {
  return (
    <div className="h-full flex flex-col items-center">
      <div className="flex-grow flex flex-col items-center justify-center space-y-5">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src="/chatgpt.png"
            className="rounded-full object-cover"
            alt="ChatGPT"
            fill
          />
        </div>
        <div className="font-bold text-xl">How can I help you today?</div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
