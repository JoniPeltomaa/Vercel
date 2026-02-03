import React from 'react'

const Footer = () => {
  return (
    <div>
      <section className="lg:px-33 px-5 py-10 my-20 mt-30 border-t border-gray-800 backdrop-blur-3xl">
        <div>
          <h1 className="text-3xl font-bold">Jonin Blogi</h1>
          <p className="text-gray-400 w-[70%]"></p>
          <div className="flex items-center gap-3 mt-5">
            <a href="" className="px-3 py-2 bg-[#7052D0] text-white rounded-lg">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="" className="px-3 py-2 bg-[#7052D0] text-white rounded-lg">
              <i className="fab fa-github"></i>
            </a>
            <a href="" className="px-3 py-2 bg-[#7052D0] text-white rounded-lg">
              <i className="fa-solid fa-globe"></i>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Footer