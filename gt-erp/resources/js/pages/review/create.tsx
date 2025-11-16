import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Invoice, Customer } from '@/types/types'; // Assuming you have these types
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

// Define the face emojis and colors
const faces = [
    { emoji: '😠', label: 'Very Bad', color: 'text-red-600' }, // 1
    { emoji: '😞', label: 'Bad', color: 'text-orange-500' }, // 2
    { emoji: '😐', label: 'Okay', color: 'text-yellow-500' }, // 3
    { emoji: '😊', label: 'Good', color: 'text-green-500' }, // 4
    { emoji: '😍', label: 'Excellent', color: 'text-blue-600' }, // 5
];

interface ReviewInvoice extends Invoice {
    customer: Customer;
    job_card: {
        vehicle: {
            vehicle_no: string;
        };
    };
}

export default function Create({ invoice }: { invoice: ReviewInvoice }) {
    const { data, setData, post, processing, errors } = useForm({
        rating: 0,
        suggestions: '',
    });

    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('review.store', invoice.review_token), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Rate Your Service" />
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-xl">
                    <h1 className="text-2xl font-bold text-center text-gray-800">
                        We value your feedback!
                    </h1>
                    <p className="mt-2 text-center text-gray-600">
                        Hi {invoice.customer.name}, please rate your service
                        for vehicle{' '}
                        <strong>{invoice.job_card.vehicle.vehicle_no}</strong>{' '}
                        (Invoice: {invoice.invoice_no}).
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <Label className="mb-4 block text-center text-lg font-medium">
                                How was your service?
                            </Label>
                            <div className="grid grid-cols-3 gap-4 justify-items-center md:flex md:justify-center md:space-x-4">
                                {faces.map((face, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <button
                                            key={ratingValue}
                                            type="button"
                                            className={`transform transition-transform duration-200 ${ratingValue <=
                                                    (hoverRating || data.rating)
                                                    ? 'scale-110'
                                                    : 'scale-90 opacity-60'
                                                }`}
                                            onClick={() =>
                                                setData('rating', ratingValue)
                                            }
                                            onMouseEnter={() =>
                                                setHoverRating(ratingValue)
                                            }
                                            onMouseLeave={() =>
                                                setHoverRating(0)
                                            }
                                        >
                                            <span
                                                className={`block text-5xl ${ratingValue === data.rating
                                                        ? face.color
                                                        : 'text-gray-400'
                                                    }`}
                                            >
                                                {face.emoji}
                                            </span>
                                            <span
                                                className={`mt-1 text-xs font-medium ${ratingValue === data.rating
                                                        ? face.color
                                                        : 'text-gray-500'
                                                    }`}
                                            >
                                                {face.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.rating && (
                                <p className="mt-2 text-center text-sm text-red-600">
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="suggestions">
                                Any suggestions for us? (Optional)
                            </Label>
                            <Textarea
                                id="suggestions"
                                className="mt-2"
                                rows={4}
                                value={data.suggestions}
                                onChange={(e) =>
                                    setData('suggestions', e.target.value)
                                }
                            />
                            {errors.suggestions && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.suggestions}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing || data.rating === 0}
                        >
                            {processing ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}