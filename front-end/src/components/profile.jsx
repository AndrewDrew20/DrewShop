import { useAuth0 } from '@auth0/auth0-react';
import { FaEnvelope, FaUser, FaShieldAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Profile = () => {
  const { user, isLoading } = useAuth0();

  // espera a que Auth0 cargue
  if (isLoading || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin'/>
      </div>
    );
  }

  const { name, picture, email } = user;

  return (
    <div className='min-h-screen bg-gray-50 py-16 px-6 lg:px-16'>
      <div className='max-w-3xl mx-auto'>

        {/* Header card */}
        <div className='bg-white rounded-2xl shadow-md overflow-hidden mb-6'>
          <div className='h-32 bg-secondary relative'>
            <div className='absolute -bottom-12 left-8'>
              <img src={picture} alt='Profile'
                className='w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover'/>
            </div>
          </div>

          <div className='pt-16 pb-8 px-8'>
            <h1 className='text-2xl font-bold text-gray-800'>{name}</h1>
            <p className='text-gray-400 text-sm mt-1'>DrewShop customer</p>

            <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3'>
                <div className='bg-secondary bg-opacity-10 p-2 rounded-lg'>
                  <FaEnvelope className='text-secondary text-sm'/>
                </div>
                <div>
                  <p className='text-xs text-gray-400 uppercase font-semibold tracking-wide'>Email</p>
                  <p className='text-sm text-gray-700 font-medium'>{email}</p>
                </div>
              </div>

              <div className='flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3'>
                <div className='bg-secondary bg-opacity-10 p-2 rounded-lg'>
                  <FaUser className='text-secondary text-sm'/>
                </div>
                <div>
                  <p className='text-xs text-gray-400 uppercase font-semibold tracking-wide'>User Name</p>
                  <p className='text-sm text-gray-700 font-medium truncate max-w-[180px]'>{name}</p>
                </div>
              </div>

             
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;