import SplitText from './SplitText/SplitText' 
import React from 'react'
import './css/Home.css'
const Home = () => {
  

  const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};
  
  return (
    <>
    <div className='home-box'>
     <SplitText
          text="👋 Welcome to Our Inventix Web!"
          className="sp"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
      />
        <i><b><p className='p-h'>Easily track your products, stock levels and sales in real time and manage everything in a smooth and simple way. 😊</p></b>  </i> 
   </div>
   
    </>
  )
}

export default Home