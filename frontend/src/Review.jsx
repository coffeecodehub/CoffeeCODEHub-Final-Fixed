import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink, FiStar, FiUploadCloud, FiX, FiCheck } from 'react-icons/fi';
import { api } from './lib/api';
import { mediaUrl } from './lib/media';

function Review() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    clientName: '',
    companyName: '',
    clientWebsiteUrl: '',
    projectLink: '',
    rating: 5,
    feedbackText: '',
  });

  const [proofScreenshots, setProofScreenshots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [proofModal, setProofModal] = useState(null);

  const fetchReviews = async () => {
    try {
      const response = await api('/reviews');
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await api('/reviews');
        if (isMounted) {
          const data = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];
          setReviews(data);
        }
      } catch {
        if (isMounted) setReviews([]);
      } finally {
        if (isMounted) setLoadingReviews(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const ratingStats = useMemo(() => {
    if (!reviews.length) return { average: '5.0', count: 0 };
    const total = reviews.reduce((acc, curr) => acc + Number(curr.rating || 5), 0);
    return {
      average: (total / reviews.length).toFixed(1),
      count: reviews.length,
    };
  }, [reviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      setError('You can upload a maximum of 2 images.');
      return;
    }
    setProofScreenshots(files);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.clientName.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!form.feedbackText.trim()) {
      setError('Please provide your feedback.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      data.append('clientName', form.clientName.trim());
      data.append('name', form.clientName.trim());
      data.append('companyName', form.companyName.trim());
      data.append('clientWebsiteUrl', form.clientWebsiteUrl.trim());
      data.append('projectLink', form.projectLink.trim());
      data.append('rating', String(form.rating));
      
      data.append('feedbackText', form.feedbackText.trim());
      data.append('comment', form.feedbackText.trim());
      data.append('feedback', form.feedbackText.trim());
      data.append('review', form.feedbackText.trim());

      proofScreenshots.forEach((file) => {
        data.append('proofScreenshot', file);
        data.append('proofScreenshots', file);
      });

      await api('/reviews', {
        method: 'POST',
        body: data,
      });

      setForm({
        clientName: '',
        companyName: '',
        clientWebsiteUrl: '',
        projectLink: '',
        rating: 5,
        feedbackText: '',
      });
      setProofScreenshots([]);
      setSubmitted(true);
      await fetchReviews();
    } catch (err) {
      setError(err?.message || 'Unable to submit review. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* TOP HEADER - SIRF BACK BUTTON */}
      <div className="mx-auto max-w-5xl mb-8 flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 active:scale-95"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* FORM / SUCCESS CONTAINER */}
      <section className="mx-auto max-w-2xl">
        <div className="rounded-[36px] border border-slate-300 bg-white p-8 sm:p-12 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d97706] mb-2">
            CLIENT FEEDBACK
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 leading-tight">
            Share your CoffeeCODEHub experience.
          </h1>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500">
            Tell future clients what we built for you. Your company website and the link to the website, app, video, repository or any other delivered work are optional.
          </p>

          {/* SUCCESS SCREEN */}
          {submitted ? (
            <div className="mt-8 rounded-3xl border border-emerald-200/80 bg-[#ecfdf5] p-6 sm:p-8 transition-all duration-300">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d1fae5] text-[#059669]">
                  <FiCheck className="h-5 w-5 stroke-[3]" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#065f46]">
                  Thank you for your feedback.
                </h3>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#047857] pl-12">
                Your review is now live on CoffeeCODEHub. We appreciate you sharing your experience.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 ml-12 inline-flex items-center gap-2 text-xs font-bold text-[#059669] hover:underline"
              >
                Submit another review →
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* ROW 1: Your Name & Company */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={form.clientName}
                      onChange={handleChange}
                      placeholder="e.g. Ahmed Khan"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Company / Business <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="e.g. ABC Technologies"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* ROW 2: Your Website & Delivered Work Link */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Your Website <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="clientWebsiteUrl"
                      value={form.clientWebsiteUrl}
                      onChange={handleChange}
                      placeholder="https://yourcompany.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Delivered Work Link <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="projectLink"
                      value={form.projectLink}
                      onChange={handleChange}
                      placeholder="Website, app, YouTube, Drive, GitHub, etc."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* RATING */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                          star <= form.rating
                            ? 'border-amber-400 bg-amber-50 text-amber-500 shadow-sm'
                            : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <FiStar className={`h-5 w-5 ${star <= form.rating ? 'fill-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* YOUR FEEDBACK */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Your Feedback
                  </label>
                  <textarea
                    name="feedbackText"
                    value={form.feedbackText}
                    onChange={handleChange}
                    rows={4}
                    placeholder="What did CoffeeCODEHub build for you, and how was your experience working with our team?"
                    className="w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* PROJECT PROOF UPLOAD */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Project Proof <span className="text-slate-400 font-normal">(optional, up to 2 images)</span>
                  </label>
                  <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center transition hover:bg-slate-50">
                    <FiUploadCloud className="h-7 w-7 text-amber-500 mb-2" />
                    <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm mb-3">
                      Upload screenshots of the website, app, dashboard or other work we delivered. Any image format is accepted.
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFiles}
                      className="text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-700 cursor-pointer"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] py-3.5 px-6 text-sm font-black text-white transition active:scale-[0.99] disabled:opacity-60 shadow-sm"
                >
                  {submitting ? 'Publishing...' : 'Publish My Review'} <FiExternalLink className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ALL REVIEWS SECTION */}
      <section className="mx-auto max-w-7xl pt-20 pb-16">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              All Reviews
            </h2>

            {/* Total Rating out of 5 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 shadow-sm">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FiStar key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-black text-slate-900">
                {ratingStats.average} / 5
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({ratingStats.count} reviews)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-100 active:scale-95"
          >
           <FiArrowLeft /> Back 
          </button>
        </div>

        {loadingReviews ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => {
              const feedback =
                r.feedbackText ||
                r.comment ||
                r.review ||
                r.feedback ||
                r.message ||
                r.quote ||
                '';

              const clientProof = r.proofScreenshot || r.proofScreenshots?.[0];

              return (
                <article
                  key={r._id || r.id}
                  className="flex min-h-[220px] flex-col justify-between rounded-[28px] border border-slate-300 bg-white p-7 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    {/* STARS */}
                    <div className="text-[#F59E0B] tracking-widest text-sm mb-3">
                      {'★'.repeat(Number(r.rating || 5))}
                    </div>

                    {/* REVIEW TEXT */}
                    <p className="text-sm font-normal leading-relaxed text-slate-800">
                      “{feedback}”
                    </p>

                    {/* PROOF LINK */}
                    {clientProof && (
                      <button
                        type="button"
                        onClick={() => setProofModal(mediaUrl(clientProof))}
                        className="mt-4 text-xs font-bold text-[#b77900] hover:underline inline-block text-left"
                      >
                        View project proof ↗
                      </button>
                    )}
                  </div>

                  {/* BOTTOM AUTHOR & PROJECT LINK */}
                  <div className="mt-8 flex items-end justify-between border-t border-slate-100 pt-4 gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-950">
                        {r.clientName || r.name || 'Client'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {r.companyName || 'Client'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {r.projectLink && (
                        <a
                          href={r.projectLink.startsWith('http') ? r.projectLink : `https://${r.projectLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                        >
                          View project <FiExternalLink />
                        </a>
                      )}
                      {r.clientWebsiteUrl && (
                        <a
                          href={r.clientWebsiteUrl.startsWith('http') ? r.clientWebsiteUrl : `https://${r.clientWebsiteUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                        >
                          Client website <FiExternalLink />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PROOF PREVIEW MODAL */}
      {proofModal && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-sm p-5 flex items-center justify-center"
          onClick={() => setProofModal(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -right-3 -top-3 z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg"
              onClick={() => setProofModal(null)}
            >
              <FiX />
            </button>
            <img
              src={proofModal}
              alt="Client project proof"
              className="max-h-[88vh] max-w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default Review;