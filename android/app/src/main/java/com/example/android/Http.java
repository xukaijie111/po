package com.example.android;


import android.util.Log;

import java.io.IOException;
import java.util.Map;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Headers;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.OkHttpClient;
import okhttp3.Request;

class Http {
        OkHttpClient client = new OkHttpClient();
//        public String postSyncRequest(String url) {
//                Headers headers = new Headers
//                                        .Builder()
//                                        .add("Content-Type", "application/json")
//                                        .build();
//
//                return postSyncRequest(url,headers);
//        }

        public void getRequest(String url, Callback callback) {

                Request request = new Request.Builder()
                        .url(url)
                        .get()
                        .build();

                Call call = client.newCall(request);

                call.enqueue(callback);

        }

        public void postRequest(String url, RequestBody body, Callback callback) {

                Request request = new Request.Builder()
                        .url(url)
                        .post(body)
                        .build();
                Call call = client.newCall(request);

                call.enqueue(callback);
        }


}