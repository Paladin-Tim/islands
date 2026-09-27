import cloud1 from '../assets/sky/cloud-1.jpg'
import cloud2 from '../assets/sky/cloud-2.png'
import cloud3 from '../assets/sky/cloud-3.jpg'
import cloud4 from '../assets/sky/cloud-4.jpg'
import moon from '../assets/sky/moon.png'
import './Sky.css'

export function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="stars" />
      <div className="sun" />
      <img className="moon" src={moon} alt="" />
      <div className="clouds">
        <img className="cloud c1" src={cloud2} alt="" />
        <img className="cloud c2" src={cloud1} alt="" />
        <img className="cloud c3" src={cloud3} alt="" />
        <img className="cloud c4" src={cloud4} alt="" />
      </div>
      <div className="haze" />
      <div className="vignette" />
    </div>
  )
}
