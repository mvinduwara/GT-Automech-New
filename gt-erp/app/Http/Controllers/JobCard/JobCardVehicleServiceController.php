<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\JobCardVehicleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobCardVehicleServiceController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_card_id' => 'required|exists:job_cards,id',
            'vehicle_service_id' => 'required|exists:vehicle_services,id',
            'vehicle_service_option_id' => 'nullable|exists:vehicle_service_options,id',
            'is_included' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $jobCardVehicleService = JobCardVehicleService::create($request->only([
            'job_card_id',
            'vehicle_service_id',
            'vehicle_service_option_id',
            'is_included',
        ]));

        return response()->json([
            'message' => 'JobCardVehicleService created successfully',
            'data' => $jobCardVehicleService,
        ], 201);
    }

    public function update(Request $request, $jobCardVehicleService_id)
    {
        $jobCardVehicleService = JobCardVehicleService::findOrFail($jobCardVehicleService_id);

        $validator = Validator::make($request->all(), [
            'job_card_id' => 'sometimes|exists:job_cards,id',
            'vehicle_service_id' => 'sometimes|exists:vehicle_services,id',
            'vehicle_service_option_id' => 'nullable|exists:vehicle_service_options,id',
            'is_included' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $jobCardVehicleService->update($request->only([
            'job_card_id',
            'vehicle_service_id',
            'vehicle_service_option_id',
            'is_included',
        ]));

        return response()->json([
            'message' => 'JobCardVehicleService updated successfully',
            'data' => $jobCardVehicleService,
        ]);
    }

    public function process($jobCardVehicleService_id)
    {
        $jobCardVehicleService = JobCardVehicleService::findOrFail($jobCardVehicleService_id);

        // Assuming 'process' means toggling the is_included status or marking as processed
        $jobCardVehicleService->is_included = !$jobCardVehicleService->is_included;
        $jobCardVehicleService->save();

        return response()->json([
            'message' => 'JobCardVehicleService processed successfully',
            'data' => $jobCardVehicleService,
        ]);
    }
}
