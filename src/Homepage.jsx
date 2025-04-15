import React, { useState } from 'react';
import SyllabusPopup from './SyllabusPopup';

export default function Homepage({ onStartCourse, onStartTheaterMode }) {
  const [showSyllabus, setShowSyllabus] = useState(false);
  return (
    // Centered container with gradient background
    <div className="flex flex-col items-center justify-center min-h-screen font-sans p-4">
      <div className="max-w-[800px] mx-auto bg-gradient-to-b from-[#f9fefc] to-[#e5f5ee] rounded-2xl shadow-md p-8 md:p-12">
        {/* AIcademy Logo */}
        <a href="https://ideas.aicademy.org">
          <img src="/aicademy-logo.png" alt="AIcademy Logo" className="w-48 mb-8 mx-auto" />
        </a>

        {/* Course Title */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Understanding and Applying AI to Study and Work
        </h1>

        {/* Popular Badge */}
        <div className="flex items-center justify-center bg-orange-50 text-orange-600 px-4 py-2 rounded-full mb-8 mx-auto gap-2 w-fit">
          <i className="fas fa-fire"></i>
          <span>1.2M learners</span>
        </div>

        {/* Course Illustration */}
        <img src="/course-illustration.png" alt="Course Illustration" className="w-64 mb-2 mx-auto" />

        {/* Author Area */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-white text-brand-green px-2 py-1 rounded-full mx-auto w-fit">
          {/* Avatar */}
          <img src="/favicon.png" alt="AIcademy" className="w-8 h-8 rounded-full" />
          
          {/* Text Block */}
          <div className="text-left">
            <div className="flex items-center gap-1 text-xs font-medium">
              <span>aicademy team</span>
              <i className="fas fa-check-circle text-brand-green text-[10px]"></i>
            </div>
            <div className="text-[10px]">
              <span>Top 3 Instructor</span>
            </div>
          </div>
        </div>

        {/* Syllabus Link */}
        <div className="text-center mb-6">
          <button 
            onClick={() => setShowSyllabus(true)}
            className="text-brand-green hover:text-brand-green-dark font-medium"
          >
            Explore What You'll Learn →
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStartTheaterMode}
            className="px-8 py-3 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg shadow-sm font-semibold"
          >
            Start Course
          </button>
          <button
            onClick={onStartCourse}
            className="px-8 py-3 bg-white border-2 border-brand-green hover:bg-brand-green-light text-brand-green-dark rounded-lg shadow-sm font-semibold"
          >
            Start in Reading Mode
          </button>
        </div>

        <SyllabusPopup 
          isOpen={showSyllabus}
          onClose={() => setShowSyllabus(false)}
        />

      </div>
    </div>
  );
}
