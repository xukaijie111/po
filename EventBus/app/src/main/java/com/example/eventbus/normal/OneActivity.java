package com.example.eventbus.normal;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import com.example.eventbus.MessageEvent;
import com.example.eventbus.R;



import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;


public class OneActivity extends AppCompatActivity {

    private TextView mTv_content, mTv_content2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_one);

        EventBus.getDefault().register(this);

        mTv_content = findViewById(R.id.tv_content);
        mTv_content2 = findViewById(R.id.tv_content2);
    }

    //3.接收TwoActivity事件处理
    @Subscribe(threadMode = ThreadMode.MAIN)
    public String  onMessageEvent(MessageEvent message) {
        //TODO 接收事件后Do something
        mTv_content.setText("onMessageEvent:" + message.name);
        Toast.makeText(this, "onMessageEvent:" + message.name, Toast.LENGTH_SHORT).show();
        Log.i("first",message.name);
        return "bajie";
    }




    public void onBtnClick(View v) {
        startActivity(new Intent(this, TwoActivity.class));
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        //2.反注册事件
        EventBus.getDefault().unregister(this);
    }
}