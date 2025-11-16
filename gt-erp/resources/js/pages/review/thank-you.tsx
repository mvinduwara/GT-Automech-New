import { Head } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';

export default function ThankYou({ message }: { message: string }) {
    return (
        <>
            <Head title="Thank You!" />
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-800">
                        Feedback Received!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {message || 'Thank you for your valuable feedback!'}
                    </p>
                    <a
                        href="https://gtdrive.lk" // Or your company's main website
                        className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-2 text-white"
                    >
                        Back to Homepage
                    </a>
                </div>
            </div>
        </>
    );
}