import { Briefcase, Shield, Users } from 'lucide-react'
import React from 'react'

const LeftSectionLogin = () => {
  return (
    <div className="space-y-8 text-center lg:text-left lg:mx-0 -mx-100 order-1 lg:order-1">
            {/* Brand Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ClientSync Pro
                  </h2>
                  <p className="text-sm text-gray-500">Manager Portal</p>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Welcome to Your
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Management Hub
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0 hidden md:block">
                Streamline client relationships, manage resources efficiently,
                and drive your team's success.
              </p>
            </div>

            {/* Feature Cards */}
            <div className=" sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 hidden lg:grid">
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Client Management
                    </h3>
                    <p className="text-sm text-gray-600">
                      Comprehensive client tracking and resource allocation
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Secure Platform
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enterprise-grade security for your sensitive data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default LeftSectionLogin;
