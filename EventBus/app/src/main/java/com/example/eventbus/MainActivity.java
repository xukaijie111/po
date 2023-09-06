package com.example.eventbus;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.example.eventbus.normal.OneActivity;

import org.greenrobot.eventbus.EventBus;

public class MainActivity extends AppCompatActivity implements View.OnClickListener{

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        findViewById(R.id.btn_normal).setOnClickListener(this);

    }

    @Override
    public void onClick(View v) {
        int id = v.getId();

        Class<?> cls = null;
        if (id == R.id.btn_normal) {
            cls = OneActivity.class;
        }

        startActivity(new Intent(this,cls));
    }

    protected void onDestroy() {
        super.onDestroy();
        EventBus.getDefault().unregister(this);
    }
}