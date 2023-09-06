package com.example.android;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Locker;
import com.google.gson.GsonBuilder;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.Response;
import okio.BufferedSink;
import wendu.dsbridge.CompletionHandler;
import wendu.dsbridge.DWebView;
import wendu.dsbridge.OnReturnValue;

import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import wendu.dsbridge.OnReturnValue;

import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.lang.reflect.Array;
import java.util.ArrayList;


import org.greenrobot.eventbus.EventBus;


public class MiniActivity extends AppCompatActivity {
    V8 jsEngine;

    DWebView dWebView;

    Http http = new Http();

    String BaseUrl = "http://10.0.2.2:3456";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mini);
        EventBus.getDefault().register(this);

        loadJsCore();
       // executeJsCode(JsCode);
    }


    //3.接收TwoActivity事件处理
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void   onMessageEvent(EventMessage message) throws JSONException {
        String msg = message.message;

        JSONObject jsonObject = new JSONObject(msg);

       // ResponseDTO dto = objectFromString(msg,ResponseDTO.class);
        executeJsCode(jsonObject.opt("code"));

    }


    public void executeJsCode(Object c) {
        String code = c.toString();
        code += "function add2(){return 'bajie'}";
        this.jsEngine = V8.createV8Runtime();
        this.jsEngine.executeVoidScript(code);

        Log.i("executeJsCode",code);
        this.loadWebView();
    }


    public void loadWebView() {
        DWebView.setWebContentsDebuggingEnabled(true);
        this.dWebView = findViewById(R.id.webview);
        dWebView.addJavascriptObject(MiniActivity.this, null);

        dWebView.loadUrl(BaseUrl + "?page=pages/home/index");


    }

    public void loadJsCore() {

         this.http.postRequest(BaseUrl + "/jsCore", new RequestBody() {
             @Nullable
             @Override
             public MediaType contentType() {
                 return  null;
             }

             @Override
             public void writeTo(@NonNull BufferedSink bufferedSink) throws IOException {

             }
         }, new Callback() {
             private String JsCode;

             @Override
             public void onFailure(@NonNull Call call, @NonNull IOException e) {

             }

             @Override
             public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {

                 EventBus.getDefault().post(new EventMessage(0, response.body().string()));
             }
         });
    }



    public static <T> T objectFromString(String jsonString, Class<T> clazzOfT) {
        if (TextUtils.isEmpty(jsonString)) {
            return null;
        }
        return new GsonBuilder().create().fromJson(jsonString, clazzOfT);
    }

    @JavascriptInterface
    public void dsBridgeWebViewMessage(Object msg, CompletionHandler<String> handler){


        dWebView.post(new Runnable() {
            @Override
            public void run() {
                String ret = excuteJsCoreFunction(msg);
                handler.complete(ret);
            }
        });


    }




    public String excuteJsCoreFunction(Object params) {

        Log.i("excuteJsCoreFunction",params.toString());
        V8Array args = new V8Array(this.jsEngine).push(params.toString());
        String ret = this.jsEngine.executeStringFunction("nativeCallJsCoreFuncName",args);
        args.close();
        return ret;
    }


}