package it.trama.voiceprobe;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.net.Uri;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.espresso.intent.Intents;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.*;
import static androidx.test.espresso.matcher.ViewMatchers.*;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.*;
import static androidx.test.espresso.intent.VerificationModes.times;
import static androidx.test.espresso.intent.matcher.IntentMatchers.*;
import static org.hamcrest.Matchers.*;

@RunWith(AndroidJUnit4.class)
public class ConsultationNavigationTest {
 @Rule public ActivityScenarioRule<MainActivity> activity = new ActivityScenarioRule<>(MainActivity.class);
 @Test public void manualExampleRequestsExactDestinationAfterConfirmation() {
  Intents.init();
  try {
   intending(hasAction(Intent.ACTION_VIEW)).respondWith(new Instrumentation.ActivityResult(Activity.RESULT_OK,null));
   onView(withText("mostra l'orario")).perform(scrollTo(),click());
   onView(withText("Vuoi aprire Orario in Docente OS?")).perform(scrollTo()).check(matches(isDisplayed()));
   intended(hasAction(Intent.ACTION_VIEW),times(0));
   onView(withText("Apri in Docente OS")).perform(scrollTo(),click());
   intended(allOf(hasAction(Intent.ACTION_VIEW),hasData(Uri.parse("https://docente-os-2026-27-beta.onrender.com/orario"))),times(1));
  } finally {Intents.release();}
 }
 @Test public void typedAsrVariantRequiresConfirmationAndCalendarOpens() {
  Intents.init();
  try {
   intending(hasAction(Intent.ACTION_VIEW)).respondWith(new Instrumentation.ActivityResult(Activity.RESULT_OK,null));
   onView(withHint("Ad esempio, apri il calendario")).perform(replaceText("mostra l orario"),closeSoftKeyboard());
   onView(withText("Controlla richiesta")).perform(scrollTo(),click());
   onView(withText("Vuoi aprire Orario in Docente OS?")).perform(scrollTo()).check(matches(isDisplayed()));
   onView(withHint("Ad esempio, apri il calendario")).perform(replaceText("apri il calendario"),closeSoftKeyboard());
   onView(withText("Controlla richiesta")).perform(scrollTo(),click());
   onView(withText("Apri in Docente OS")).perform(scrollTo(),click());
   intended(allOf(hasAction(Intent.ACTION_VIEW),hasData(Uri.parse("https://docente-os-2026-27-beta.onrender.com/calendario"))),times(1));
   intended(hasAction(Intent.ACTION_VIEW),times(1));
  } finally {Intents.release();}
 }
 @Test public void negationDoesNotExposeConfirmation() {
  Intents.init();
  try {
   onView(withHint("Ad esempio, apri il calendario")).perform(replaceText("non aprire il calendario"),closeSoftKeyboard());
   onView(withText("Controlla richiesta")).perform(scrollTo(),click());
   onView(withText("Apri in Docente OS")).check(matches(withEffectiveVisibility(Visibility.GONE)));
   intended(hasAction(Intent.ACTION_VIEW),times(0));
  } finally {Intents.release();}
 }
}
