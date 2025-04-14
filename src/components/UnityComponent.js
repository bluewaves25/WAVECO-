import React from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { IoIosArrowBack } from 'react-icons/io';
import '../styles/Unity.css';

const UnityComponent = ({ theme, setMode }) => {
  const { unityProvider } = useUnityContext({
    loaderUrl: '/unity/Build/WAVECO-WebGL.loader.js',
    dataUrl: '/unity/Build/WAVECO-WebGL.data',
    frameworkUrl: '/unity/Build/WAVECO-WebGL.framework.js',
    codeUrl: '/unity/Build/WAVECO-WebGL.wasm',
  });

  return (
    <div className={`unity-container ${theme}`}>
      <IoIosArrowBack className={`back-arrow ${theme}`} onClick={() => setMode(null)} />
      <h2>Stream</h2>
      <Unity unityProvider={unityProvider} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default UnityComponent;