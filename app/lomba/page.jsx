'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const VideoCard = ({ video }) => {
    const extractYoutubeID = (url) => {
        const match = url.match(/(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&]+)/)
        return match ? match[1] : null
    }

    const youtubeID = extractYoutubeID(video.link)
    const embedUrl = `https://www.youtube.com/embed/${youtubeID}`

    return (
        <div className="flex justify-evenly my-4 ">
            <div className="rounded-lg shadow-lg bg-white max-w-sm border border-gray-300">
                <div className="w-full aspect-video">
                    {youtubeID ? (
                        <iframe
                            className="w-full h-full rounded-t-lg"
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <p className="text-center p-4 text-red-500">Invalid YouTube Link</p>
                    )}
                </div>
                <div className="p-6">
                    <h5 className="text-gray-900 text-xl font-medium mb-2">{video.j_lomba}</h5>
                    <div className="flex flex-col gap-2">
                        <p className="text-gray-700 text-base">{video.nama}</p>
                        <div className="self-start px-3 py-1 text-gray-600 border border-gray-400 text-xs font-semibold uppercase rounded-full whitespace-nowrap">
                            {video.gender}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Lomba = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchVideos = async () => {
            const { data: videos, error } = await supabase.from('lomba').select('*')

            if (error) {
                console.error('Supabase error:', error.message, error.details)
            } else {
                setData(videos)
            }
        }

        fetchVideos()
    }, [])

    const grouped = data.reduce((acc, item) => {
        if (!acc[item.nama_lomba]) acc[item.nama_lomba] = []
        acc[item.nama_lomba].push(item)
        return acc
    }, {})

    return (
        <div className="w-full bg-white/90 backdrop-blur-md min-h-screen">
            {Object.entries(grouped).map(([namaLomba, videos]) => (
                <div key={namaLomba}>
                    <div className="w-1/3 mx-auto pt-20 mb-10 text-center">
                        <h3 className="text-gray-700 border-b text-2xl font-bold  border-slate-300 mb-10 inline-block pb-2">
                            {namaLomba.toUpperCase()}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-5 pb-10">
                        {videos.map((video, idx) => (
                            <VideoCard key={idx} video={video} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Lomba
