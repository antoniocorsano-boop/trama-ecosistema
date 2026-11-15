package it.trama.voiceprobe;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.*;
import org.vosk.Model;
import org.vosk.Recognizer;
import org.json.JSONObject;
import java.io.*;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class MainActivity extends Activity {
 private final Handler ui = new Handler(Looper.getMainLooper());
 private final ExecutorService worker = Executors.newSingleThreadExecutor();
 private Model model;
 private volatile boolean recording, cancelled, closed;
 private boolean active, preparing;
 private int revision;
 private Button mic, next, confirm;
 private EditText request;
 private TextView status, proposal;
 private String reviewed, target;
 private static final int RATE=16000;
 private int dp(int x){return Math.round(x*getResources().getDisplayMetrics().density);}
 private TextView text(String s,int size){TextView t=new TextView(this);t.setText(s);t.setTextSize(size);t.setTextColor(0xff203b34);return t;}
 private Button button(String s){Button b=new Button(this);b.setText(s);b.setAllCaps(false);b.setMinHeight(dp(48));return b;}
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  getWindow().setFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE,android.view.WindowManager.LayoutParams.FLAG_SECURE);
  ScrollView sc=new ScrollView(this);LinearLayout l=new LinearLayout(this);l.setOrientation(1);l.setPadding(dp(22),dp(28),dp(22),dp(24));l.setBackgroundColor(0xfff4f7f5);sc.addView(l);setContentView(sc);
  l.addView(text("TRAMA · Ambiente di prova",14));l.addView(text("Come posso aiutarti?",28));
  l.addView(text("Parla oppure scrivi una richiesta.",16));
  mic=button("Parla");mic.setTextColor(Color.WHITE);mic.setBackgroundTintList(android.content.res.ColorStateList.valueOf(0xff245e54));l.addView(mic);
  status=text("Preparazione della voce italiana…",15);l.addView(status);
  request=new EditText(this);request.setHint("Ad esempio, apri il calendario");request.setInputType(android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);request.setSaveEnabled(false);request.setFreezesText(false);request.setFilters(new android.text.InputFilter[]{new android.text.InputFilter.LengthFilter(180)});l.addView(request);
  for(String example:new String[]{"mostra l'orario","apri il calendario","apri la lezione","cerca un laboratorio"}){
   Button b=button(example);l.addView(b);b.setOnClickListener(v->{if(!active){request.setText(example);request.setSelection(request.length());}});
  }
  next=button("Continua");l.addView(next);
  proposal=text("",18);l.addView(proposal);confirm=button("Conferma");l.addView(confirm);confirm.setVisibility(View.GONE);
  Button cancel=button("Annulla");l.addView(cancel);l.addView(text("Solo richieste di esempio. Nessuna azione modifica TRAMA. La voce è elaborata sul telefono.",13));
  request.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int start,int count,int after){} public void onTextChanged(CharSequence s,int start,int before,int count){invalidateReview();} public void afterTextChanged(Editable e){}});
  mic.setOnClickListener(v->{if(active){recording=false;mic.setEnabled(false);status.setText("Sto elaborando…");}else if(checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},1);}else startVoice();});
  next.setOnClickListener(v->{if(active)return;reviewed=normalize(request.getText().toString());target=resolve(reviewed);proposal.setText(target==null?"Prova con uno degli esempi.": "Vuoi aprire: "+target+"?");confirm.setVisibility(target==null?View.GONE:View.VISIBLE);});
  confirm.setOnClickListener(v->{if(!active&&target!=null&&reviewed.equals(normalize(request.getText().toString()))){invalidateReview();proposal.setText("Richiesta confermata. È soltanto una prova.");}});
  cancel.setOnClickListener(v->{cancelVoice();request.setText("");invalidateReview();status.setText("Richiesta annullata.");});
  preparing=true;mic.setEnabled(false);worker.execute(()->{Model loaded=null;try{loaded=new Model(prepareModel().getAbsolutePath());Model ready=loaded;ui.post(()->{if(closed){ready.close();return;}model=ready;preparing=false;mic.setEnabled(!active);status.setText("Tocca Parla per iniziare.");});}catch(Exception e){if(loaded!=null)loaded.close();ui.post(()->{if(!closed){preparing=false;status.setText("La voce non è disponibile. Puoi scrivere.");}});}});
 }
 private File prepareModel() throws IOException {
  File root=new File(getFilesDir(),"it-022"), marker=new File(root,".ready");
  if(marker.isFile())return new File(root,"vosk-model-small-it-0.22");
  if(!root.exists()&&!root.mkdirs())throw new IOException("model directory");
  try(ZipInputStream zip=new ZipInputStream(getAssets().open("model-it.zip"))){
   ZipEntry entry;byte[] buf=new byte[16384];
   while((entry=zip.getNextEntry())!=null){File out=new File(root,entry.getName());if(!out.getCanonicalPath().startsWith(root.getCanonicalPath()+File.separator))throw new IOException("unsafe archive");if(entry.isDirectory()){if(!out.isDirectory()&&!out.mkdirs())throw new IOException("mkdir");}else{File parent=out.getParentFile();if(!parent.isDirectory()&&!parent.mkdirs())throw new IOException("mkdir");try(OutputStream stream=new FileOutputStream(out)){int n;while((n=zip.read(buf))>0)stream.write(buf,0,n);}}zip.closeEntry();}
  }
  if(!marker.createNewFile()&&!marker.isFile())throw new IOException("marker");
  return new File(root,"vosk-model-small-it-0.22");
 }
 @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] grants){super.onRequestPermissionsResult(code,permissions,grants);if(code==1&&grants.length>0&&grants[0]==PackageManager.PERMISSION_GRANTED&&!closed&&hasWindowFocus())startVoice();else if(code==1)status.setText("Microfono non autorizzato. Puoi scrivere.");}
 private void startVoice(){
  if(model==null||active||closed||preparing)return;
  invalidateReview();request.setText("");active=true;cancelled=false;recording=true;int session=++revision;Model m=model;
  mic.setText("Termina");mic.setEnabled(true);request.setEnabled(false);next.setEnabled(false);status.setText("Ti ascolto… Tocca Termina quando hai finito.");
  worker.execute(()->{
   StringBuilder words=new StringBuilder();String result="";boolean failed=false;AudioRecord recorder=null;
   try(Recognizer recognizer=new Recognizer(m,RATE)){
    if(!recording)return;
    int size=Math.max(AudioRecord.getMinBufferSize(RATE,AudioFormat.CHANNEL_IN_MONO,AudioFormat.ENCODING_PCM_16BIT),RATE);
    recorder=new AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION,RATE,AudioFormat.CHANNEL_IN_MONO,AudioFormat.ENCODING_PCM_16BIT,size);
    if(recorder.getState()!=AudioRecord.STATE_INITIALIZED)throw new IOException("microphone");
    recorder.startRecording();if(recorder.getRecordingState()!=AudioRecord.RECORDSTATE_RECORDING)throw new IOException("microphone");
    short[] samples=new short[1600];long deadline=android.os.SystemClock.elapsedRealtime()+12000;
    while(recording&&android.os.SystemClock.elapsedRealtime()<deadline){int n=recorder.read(samples,0,samples.length);if(n<=0)throw new IOException("read");if(recognizer.acceptWaveForm(samples,n))append(words,recognizer.getResult());}
    if(!cancelled){append(words,recognizer.getFinalResult());result=words.toString().trim();}
   }catch(Exception e){failed=true;}finally{
    recording=false;
    if(recorder!=null){try{recorder.stop();}catch(Exception ignored){}recorder.release();}
    String finalText=result;boolean error=failed;ui.post(()->{if(closed)return;active=false;mic.setText("Parla");mic.setEnabled(model!=null);request.setEnabled(true);next.setEnabled(true);if(session!=revision||cancelled)return;if(error){status.setText("Non sono riuscito ad ascoltarti. Puoi scrivere.");return;}if(finalText.length()>180){status.setText("Prova una richiesta più breve.");return;}request.setText(finalText);status.setText(finalText.isEmpty()?"Non ho sentito una richiesta. Riprova.":"Rileggi la richiesta e continua.");});
   }
  });
 }
 private static void append(StringBuilder b,String json)throws Exception{String s=new JSONObject(json).optString("text","").trim();if(!s.isEmpty()){if(b.length()>0)b.append(' ');b.append(s);}}
 private static String normalize(String s){return s.trim().toLowerCase(Locale.ITALIAN).replace('’','\'').replaceAll("\\s+"," ").replaceAll("[.!?]+$","");}
 private static String resolve(String s){switch(s){case "mostra l'orario":case "mostra orario":return "Orario";case "apri il calendario":case "apri calendario":return "Calendario";case "apri la lezione":case "apri lezione":return "Preparazione della lezione";case "cerca un laboratorio":case "cerca laboratorio":return "Ricerca laboratori";default:return null;}}
 private void invalidateReview(){target=null;reviewed=null;proposal.setText("");confirm.setVisibility(View.GONE);}
 private void cancelVoice(){revision++;cancelled=true;recording=false;invalidateReview();}
 @Override protected void onPause(){cancelVoice();request.setText("");super.onPause();}
 @Override protected void onDestroy(){closed=true;cancelVoice();Model m=model;if(m!=null)worker.execute(m::close);worker.shutdown();super.onDestroy();}
}
