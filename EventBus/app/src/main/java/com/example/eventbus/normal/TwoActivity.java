package com.example.eventbus.normal;

import androidx.appcompat.app.AppCompatActivity;

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

public class TwoActivity extends AppCompatActivity implements View.OnClickListener {
    private TextView mTv_content;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_two);
        findViewById(R.id.btn_send).setOnClickListener(this);
        EventBus.getDefault().register(this);
        mTv_content = findViewById(R.id.tv_content);
    }

    //3.接收TwoActivity事件处理
    @Subscribe(threadMode = ThreadMode.MAIN)
    public String  onMessageEvent(MessageEvent message) {
        Log.i("second",message.name);
        return "bajie";
    }

    @Override
    public void onClick(View view) {
        int id = view.getId();
        if (id == R.id.btn_send) {
            mTv_content.setText("对OneActivity发布事件");
            //4.发布事件
            EventBus.getDefault().post(new MessageEvent("接收到TwoActivity发送过来的事件啦"));

        }
    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        //2.反注册事件
        EventBus.getDefault().unregister(this);
    }
}