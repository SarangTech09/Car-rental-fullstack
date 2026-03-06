import React, { use } from 'react'
import Title from './Title'
import { assets } from '../assets/assets'
import CarCard from './CarCard'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import {motion} from 'motion/react'

const FeaturedSection = () => {

    const {cars} = useAppContext();

    const navigate = useNavigate();

  return (
    <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: 'easeInOut' }}
    className='flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32'>
        <motion.div
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         transition={{ duration: 1, delay: 0.5 }}>
            <Title title="Featured Vehicles" subTitle="Explore our selection of premium vehicles available for your next adventure" />
        </motion.div>

        <motion.div
         initial={{ opacity: 0, y: 100 }}
         whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18'>
            {
                cars.slice(0,6).map((car)=> (
                    <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    key={car._id}>
                        <CarCard car={car} />
                    </motion.div>
                ))
            }
        </motion.div>

        <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6}}
        onClick={()=> {
            navigate('/cars'); scrollTo(0,0)
        }} className='flex items-center justify-center gap-2 px-6 py-2 border border-border-color hover:bg-gray-50 rounded-md mt-18 cursor-pointer'>
            Explore all Cars <img src={assets.arrow_icon} alt="arrow" />
        </motion.button>
    </motion.div>
  )
}

export default FeaturedSection