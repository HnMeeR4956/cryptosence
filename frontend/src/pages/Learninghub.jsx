import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import tradingInZoneCover from "../assets/tradinginzonecover.jpeg";
import adaptiveMarketsCover from "../assets/Adaptivemarketscover.jpeg";
import psychologyOfMoneyCover from "../assets/psychologyofmoneycover.jpeg";
import technicalAnalysisCover from "../assets/technicalanalysiscover.jpeg";

function LearningHub() {
  const [search, setSearch] = useState("");

  const books = [
    {
      title: "Trading in the Zone",
      author: "Mark Douglas",
      description: "A book about trading discipline, confidence, risk, and decision-making.",
      source: "Penguin Random House",
      link: "https://www.penguinrandomhouse.com/books/350665/trading-in-the-zone-by-mark-douglas/",
      image: tradingInZoneCover,
    },
    {
      title: "Adaptive Markets",
      author: "Andrew W. Lo",
      description: "Explains financial markets using ideas from economics, psychology, and evolution.",
      source: "Google Books",
      link: "https://books.google.com/books/about/Adaptive_Markets.html?id=Xi2GDwAAQBAJ",
      image: adaptiveMarketsCover,
    },
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      description: "Explores how behaviour and personal experience influence financial decisions.",
      source: "Harriman House",
      link: "https://www.harriman-house.com/authors/morgan-housel/the-psychology-of-money/9780857197689",
      image: psychologyOfMoneyCover,
    },
    {
      title: "Technical Analysis of the Financial Markets",
      author: "John J. Murphy",
      description: "Introduces charts, indicators, market behaviour, and technical-analysis methods.",
      source: "Penguin Random House Higher Education",
      link: "https://penguinrandomhousehighereducation.com/book/?isbn=9780735200661",
      image: technicalAnalysisCover,
    },
  ];

  const websites = [
    {
      title: "BabyPips",
      description:
        "BabyPips is an educational site that teaches beginners how to trade forex and crypto through free lessons and market analysis tools.",
      link: "https://www.babypips.com/",
    },
    {
      title: "Waqar Zaka",
      description:
        "This website is an online educational platform that offers specialized training in crypto trading and blockchain technology.",
      link: "https://www.waqarzaka.net/",
    },
    {
      title: "Badar Trader",
      description:
        "Badar Trader is a Pakistan-based Forex trading mentorship program offering live classes and liquidity strategies to help students.",
      link: "https://badartrader.com/",
    },
    {
      title: "Udemy Trading Course",
      description:
        "This course teaches beginners how to trade the Forex market from scratch, covering basics, chart analysis, and risk management.",
      link: "https://www.udemy.com/course/the-complete-foundation-forex-trading-course/?couponCode=MT260504G1",
    },
  ];

  const youtubeChannels = [
    {
      title: "P4 Provider",
      description:
        "P4 Provider is a leading Pakistani institute that teaches crypto and forex trading through expert mentorship.",
      link: "https://www.youtube.com/@P4Provider",
    },
    {
      title: "Syed Aun",
      description:
        "Syed Aun is a veteran trader and founder of Pakistan's top online trading community with deep market insight.",
      link: "https://www.youtube.com/@SyedAunOfficial",
    },
    {
      title: "The Trading Geek",
      description:
        "The Trading Geek teaches simplified Smart Money Concepts to help beginners build consistency in trading.",
      link: "https://www.youtube.com/@TheTradingGeek",
    },
    {
      title: "JeaFxForexTrading",
      description:
        "JeaFx is an educational channel focused on price action trading, market psychology, and risk management.",
      link: "https://www.youtube.com/@JeaFxForexTrading",
    },
  ];

  const filteredBooks = useMemo(
    () =>
      books.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      ),
    [search, books]
  );

  const filteredWebsites = useMemo(
    () =>
      websites.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      ),
    [search, websites]
  );

  const filteredChannels = useMemo(
    () =>
      youtubeChannels.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      ),
    [search, youtubeChannels]
  );

  return (
    <div className="min-h-screen md:h-screen bg-[#050b16] text-white flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto min-w-0">
        <main className="flex-1 px-4 py-4">
          <div className="max-w-[1180px] mx-auto">
            {/* Search bar */}
            <div className="bg-[#0d1727] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-slate-500 text-sm">🔎</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, websites, or channels..."
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
              />
            </div>

            {/* Hero */}
            <div className="mt-6 bg-[#0d1727] border border-white/5 rounded-3xl px-6 py-12 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                The Learning Hub
              </h1>
              <p className="text-slate-400 mt-4 max-w-3xl mx-auto leading-7">
                Your curated directory for the best crypto education. Handpicked
                books, websites, and channels to take you from beginner to pro
                trader.
              </p>
              <div className="mt-6 max-w-3xl mx-auto rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 flex items-start gap-3 text-left">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-cyan-400/10 flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div>
                  <p className="text-cyan-300 text-sm font-semibold">
                    External Resource Notice
                  </p>
                  <p className="mt-1 text-slate-400 text-xs leading-5">
                    Books and external learning content belong to their respective
                    publishers. CryptoSense only provides links to official sources
                    and does not host third-party books.
                  </p>
                </div>
              </div>
            </div>

            {/* Top Books */}
            <section className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-md bg-blue-500"></div>
                <h2 className="text-2xl font-bold">Top Books</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredBooks.map((book) => (
                  <div
                    key={book.title}
                    className="bg-[#0d1727] border border-white/5 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="h-56 bg-gradient-to-br from-blue-600/20 to-cyan-500/5 flex items-center justify-center overflow-hidden p-4">
                      <img
                        src={book.image}
                        alt={`${book.title} book cover`}
                        className="h-full w-auto max-w-full object-contain rounded-md shadow-xl"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-semibold">{book.title}</h3>
                      <p className="mt-1 text-cyan-400 text-sm">{book.author}</p>
                      <p className="mt-3 text-slate-400 text-sm leading-6 flex-1">
                        {book.description}
                      </p>
                      <p className="mt-3 text-slate-500 text-xs">
                        Official source: {book.source}
                      </p>
                      <button
                        onClick={() =>
                          window.open(book.link, "_blank", "noopener,noreferrer")
                        }
                        className="mt-4 bg-blue-600 hover:bg-blue-500 transition rounded-lg py-2.5 text-sm font-medium"
                      >
                        Buy Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Websites */}
            <section className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🌐</div>
                <h2 className="text-2xl font-bold">Top Websites &amp; Courses</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredWebsites.map((site) => (
                  <div
                    key={site.title}
                    className="bg-[#0d1727] border border-white/5 rounded-2xl p-5 flex flex-col"
                  >
                    <h3 className="text-lg font-semibold">{site.title}</h3>
                    <p className="text-slate-400 text-sm leading-7 mt-4 flex-1">
                      {site.description}
                    </p>
                    <button
                      onClick={() =>
                        window.open(site.link, "_blank", "noopener,noreferrer")
                      }
                      className="mt-5 bg-blue-600 hover:bg-blue-500 transition rounded-lg py-2.5 text-sm font-medium"
                    >
                      Visit Website
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* YouTube */}
            <section className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">📺</div>
                <h2 className="text-2xl font-bold">Top YouTube Channels</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.title}
                    className="bg-[#0d1727] border border-white/5 rounded-2xl p-5 flex flex-col"
                  >
                    <h3 className="text-lg font-semibold">{channel.title}</h3>
                    <p className="text-slate-400 text-sm leading-7 mt-4 flex-1">
                      {channel.description}
                    </p>
                    <button
                      onClick={() =>
                        window.open(channel.link, "_blank", "noopener,noreferrer")
                      }
                      className="mt-5 bg-blue-600 hover:bg-blue-500 transition rounded-lg py-2.5 text-sm font-medium"
                    >
                      Watch Channel
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
export default LearningHub;
